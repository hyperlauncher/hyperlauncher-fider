package privy

import (
	"errors"
	"fmt"
	"time"

	"github.com/getfider/fider/app/pkg/env"
	"github.com/golang-jwt/jwt/v4"
)

type PrivyClaims struct {
	AppId      string `json:"aud,omitempty"`
	Expiration uint64 `json:"exp,omitempty"`
	Issuer     string `json:"iss,omitempty"`
	UserId     string `json:"sub,omitempty"`
}

var (
	appId     = env.Config.OAuth.Privy.AppID
	key       = env.Config.OAuth.Privy.Key
	publicKey = "-----BEGIN PUBLIC KEY-----\n" + key + "\n-----END PUBLIC KEY-----"
)

func (c *PrivyClaims) Valid() error {
	if c.AppId != appId {
		return errors.New("aud claim must be your Privy App ID")
	}
	if c.Issuer != "privy.io" {
		return errors.New("iss claim must be 'privy.io'")
	}
	if c.Expiration < uint64(time.Now().Unix()) {
		return errors.New("token is expired")
	}
	return nil
}

func keyFunc(token *jwt.Token) (interface{}, error) {
	if token.Method.Alg() != "ES256" {
		return nil, fmt.Errorf("unexpected JWT signing method: %v", token.Header["alg"])
	}
	pubKey, err := jwt.ParseECPublicKeyFromPEM([]byte(publicKey))
	if err != nil {
		return nil, fmt.Errorf("failed to parse EC public key: %v", err)
	}
	return pubKey, nil
}

func DecodePrivyToken(token string) (*PrivyClaims, error) {
	if key == "" {
		return nil, errors.New("privy key is not configured")
	}

	claims := &PrivyClaims{}
	parsedToken, err := jwt.ParseWithClaims(token, claims, keyFunc)
	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			return nil, errors.New("invalid token signature")
		}
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorExpired != 0 {
				return nil, errors.New("token has expired")
			}
			if ve.Errors&jwt.ValidationErrorMalformed != 0 {
				return nil, errors.New("token is malformed")
			}
		}
		return nil, fmt.Errorf("failed to decode Privy token: %v", err)
	}

	if !parsedToken.Valid {
		return nil, errors.New("invalid token")
	}

	if err := claims.Valid(); err != nil {
		return nil, fmt.Errorf("invalid claims: %v", err)
	}

	return claims, nil
}
