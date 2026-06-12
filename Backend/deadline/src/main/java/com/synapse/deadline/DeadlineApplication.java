package com.synapse.deadline;

import com.synapse.deadline.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DeadlineApplication {

	public static void main(String[] args) {
		DotenvLoader.carregar();
		SpringApplication.run(DeadlineApplication.class, args);
	}

}
