resource "aws_security_group" "api_gateway" {
  name   = "api-gw-link"
  vpc_id = data.aws_vpc.default.id

  # Allow all outbound so API Gateway can initiate requests
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_vpc_link" "api_vpc_link" {
  name               = "app-vpc-link"
  subnet_ids         = data.aws_subnets.default.ids
  security_group_ids = [aws_security_group.api_gateway.id]
}

resource "aws_apigatewayv2_integration" "api_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.api_vpc_link.id
  integration_uri    = module.laravel.laravel_discover_service.arn # via Cloud Map DNS
}

resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api_integration.id}"
}

resource "aws_cloudwatch_log_group" "api_gw_logs" {
  name              = "/aws/apigateway/${aws_apigatewayv2_api.http_api.name}"
  retention_in_days = 1
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw_logs.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      ip                      = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      httpMethod              = "$context.httpMethod"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}
