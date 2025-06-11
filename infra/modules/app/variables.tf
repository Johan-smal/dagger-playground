variable "aws_region" {
  type = string
}

variable "app_ecr" {
  type = object({
    repository_url = string
  })
}

variable "app_key" {
  type        = string
  description = "Base64 encoded application key for Laravel"
}
