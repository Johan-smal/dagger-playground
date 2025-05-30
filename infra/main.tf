terraform {
  required_version = ">= 1.11.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.98.0"
    }
  }
  backend "s3" {
    # set variables in backend.tfvars
  }
}

provider "aws" {
  region = var.aws_region
}

resource "null_resource" "example" {
  # This is just a placeholder resource to ensure the provider is initialized
  # and to avoid any issues with empty configurations.
  provisioner "local-exec" {
    command = "echo 'AWS provider initialized successfully.'"
  }
}
