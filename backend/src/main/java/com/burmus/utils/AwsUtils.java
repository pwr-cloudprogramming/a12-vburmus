package com.burmus.utils;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicSessionCredentials;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.experimental.UtilityClass;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Component
public class AwsUtils {
    @Value("${aws.s3.bucket}")
    private static String bucket;
    @Value("${aws.s3.region}")
    private static String regionName;

    public static String loadImage(MultipartFile image, String directory, String username) {
        try (InputStream imageInputStream = image.getInputStream()) {
            Regions region = Regions.fromName(regionName);
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                                                     .withRegion(region)
                                                     .withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
                                                     .build();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(image.getContentType());
            metadata.setContentLength(image.getSize());

            String objectKey = directory + username + ".jpg";
            s3Client.putObject(new PutObjectRequest(bucket, objectKey, imageInputStream, metadata));
            return "https://" + bucket + ".s3." + region.getName() + ".amazonaws.com/" + objectKey;
        } catch (IOException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
    }
    @Value("${aws.s3.region}")
    public void setRegionName(String regionName) {
        AwsUtils.regionName = regionName;
    }

    @Value("${aws.s3.bucket}")
    public void setBucket(String bucket) {
        AwsUtils.bucket = bucket;
    }
}