package com.examly.springapp.configuration;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;

public class CryptoUtils {
    private static final String ALGORITHM = "AES";

    public static byte[] encrypt(byte[] data, String secretKeyBase64) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(secretKeyBase64);
        Key key = new SecretKeySpec(keyBytes, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data);
    }

    public static byte[] decrypt(byte[] encryptedData, String secretKeyBase64) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(secretKeyBase64);
        Key key = new SecretKeySpec(keyBytes, ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key);
        return cipher.doFinal(encryptedData);
    }

    public static String generateKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
        keyGen.init(256);
        SecretKey secretKey = keyGen.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
}
