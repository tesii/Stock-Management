package com.instaplus.stock_mvp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling

public class StockMvpApplication {

	public static void main(String[] args) {
		SpringApplication.run(StockMvpApplication.class, args);
	}

}
