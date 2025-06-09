variable "aws_region" {
  type = string
}

variable "app_ecr" {
  type = object({
    repository_url = string
  })
}
