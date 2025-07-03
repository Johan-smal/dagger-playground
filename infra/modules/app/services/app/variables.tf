variable "aws_region" {
  description = "The AWS region where the application will be deployed."
  type        = string
}
variable "ecs_cluster" {
  type = object({
    id = string
  })
}
variable "public_subnets" {
  description = "List of public subnet IDs for the ECS service."
  type        = list(string)
}
variable "vpc_id" {
  description = "The VPC ID where the ECS service will be deployed."
  type        = string
}
variable "service_discovery_private_dns_namespace" {
  type = object({
    id = string
  })
}
variable "app_key_secret_arn" {
  description = "The ARN of the AWS Secrets Manager secret containing the application key."
  type        = string
}
variable "app_ecr" {
  type = object({
    repository_url = string
  })
}
