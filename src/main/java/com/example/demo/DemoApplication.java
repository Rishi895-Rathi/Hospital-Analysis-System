package com.example.demo;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableCaching
@ComponentScan(basePackages = {
		"com.example.demo",
		"com.example.demo.security",
		"com.example.demo.Controller",
		"com.example.demo.service",
		"com.example.demo.repository"
})
public class DemoApplication {
	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		System.setProperty("DB_URL", dotenv.get("DB_URL", ""));
		System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME", ""));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD", ""));
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET", ""));
		System.setProperty("JWT_EXPIRATION", dotenv.get("JWT_EXPIRATION", "86400000"));
		System.setProperty("REDIS_HOST", dotenv.get("REDIS_HOST", "localhost"));
		System.setProperty("REDIS_PORT", dotenv.get("REDIS_PORT", "6379"));

		SpringApplication.run(DemoApplication.class, args);
	}
}