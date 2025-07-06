resource "aws_ecr_repository" "laravel_ecr" {
  name                 = "laravel"
  image_tag_mutability = "MUTABLE"
}

output "laravel_ecr" {
  value = {
    repository_url = aws_ecr_repository.laravel_ecr.repository_url
  }
  description = "The ECR repository URL for the Laravel application."
}

