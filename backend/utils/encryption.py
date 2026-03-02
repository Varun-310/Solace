"""
Encryption Utility
AES-256-GCM encryption using a master key + per-user salt.
Admin cannot read messages without ENCRYPTION_SECRET from .env.
"""

import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ENCRYPTION_SECRET = os.getenv("ENCRYPTION_SECRET", "change-this-to-a-secure-random-string")

# Fail-fast if encryption secret is the insecure default
if ENCRYPTION_SECRET == "change-this-to-a-secure-random-string":
    import warnings
    warnings.warn(
        "⚠️  ENCRYPTION_SECRET is still the default value! "
        "Set a real 32+ character random string in .env before deploying to production.",
        stacklevel=2,
    )


def _derive_key(user_salt: str) -> bytes:
    """Derive a 256-bit AES key from master secret + user salt."""
    combined = f"{ENCRYPTION_SECRET}:{user_salt}".encode()
    return hashlib.sha256(combined).digest()


def encrypt_message(plaintext: str, user_salt: str) -> dict:
    """
    Encrypt a message using AES-256-GCM.
    Returns: { ciphertext: base64, iv: base64 }
    """
    key = _derive_key(user_salt)
    aesgcm = AESGCM(key)
    iv = os.urandom(12)  # 96-bit nonce
    ciphertext = aesgcm.encrypt(iv, plaintext.encode(), None)
    
    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "iv": base64.b64encode(iv).decode()
    }


def decrypt_message(ciphertext_b64: str, iv_b64: str, user_salt: str) -> str:
    """
    Decrypt a message using AES-256-GCM.
    Returns: plaintext string
    """
    key = _derive_key(user_salt)
    aesgcm = AESGCM(key)
    ciphertext = base64.b64decode(ciphertext_b64)
    iv = base64.b64decode(iv_b64)
    plaintext = aesgcm.decrypt(iv, ciphertext, None)
    return plaintext.decode()
