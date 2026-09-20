resource "random_password" "postgres" {
  length  = 32
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# Allocate the EIP standalone (no `instance` attribute) so its address is
# known before the instance exists, which lets us bake it into user_data
# (CORS_ORIGINS) without an instance <-> EIP circular dependency.
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name    = "${var.project_name}-eip"
    Project = var.project_name
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = aws_key_pair.deploy.key_name

  root_block_device {
    volume_type = "gp3"
    volume_size = var.root_volume_gb
  }

  user_data = templatefile("${path.module}/templates/user_data.sh.tpl", {
    project_name      = var.project_name
    postgres_password = random_password.postgres.result
    jwt_secret        = random_password.jwt_secret.result
    elastic_ip        = aws_eip.app.public_ip
  })

  tags = {
    Name    = "${var.project_name}-app"
    Project = var.project_name
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}

resource "aws_budgets_budget" "monthly" {
  count = var.budget_alert_email != "" ? 1 : 0

  name         = "${var.project_name}-monthly-budget"
  budget_type  = "COST"
  limit_amount = tostring(var.budget_limit_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }
}
