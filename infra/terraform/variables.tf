variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Used to tag/name every resource"
  type        = string
  default     = "cricstate"
}

variable "instance_type" {
  description = "EC2 instance type. t3.micro stays inside the AWS free tier."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_gb" {
  description = "Root EBS volume size in GB (free tier covers up to 30GB)"
  type        = number
  default     = 20
}

variable "ssh_public_key" {
  description = "Public half of the deploy SSH keypair (private half goes into the GitHub Actions secret EC2_SSH_PRIVATE_KEY, never into Terraform)"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH into the instance. Defaults open (0.0.0.0/0) because the operator's IP isn't known ahead of time - tighten this to your own IP/32 after provisioning."
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_repo_url" {
  description = "Git remote the box will have code rsync'd into (informational only, used in tags/outputs)"
  type        = string
  default     = "https://github.com/abhiroy00/cricstate.git"
}

variable "budget_alert_email" {
  description = "If set, creates a monthly AWS Budget alert sent to this email. Leave empty to skip."
  type        = string
  default     = ""
}

variable "budget_limit_usd" {
  description = "Monthly budget threshold in USD for the alert"
  type        = number
  default     = 20
}
