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

module "tools" {
  source = "./modules/tools"
}

module "app" {
  source     = "./modules/app"
  app_ecr    = module.tools.app_ecr
  aws_region = var.aws_region
  app_key    = var.app_key
  depends_on = [module.tools]
}

output "tools" {
  value = module.tools
}
