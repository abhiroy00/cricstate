# CricState infrastructure (Terraform)

Provisions exactly one thing: a single EC2 instance (Ubuntu 22.04, t3.micro) with
Docker + Compose installed, an Elastic IP, and a security group that only opens
22/80/443. Postgres/Redis/backend are never exposed to the internet — only nginx
is, and it fronts everything. See `../../README.md` → "Deployment" for the full
one-time setup flow (IAM user, SSH keypair, GitHub secrets).

## One-time setup

1. In the AWS console, create an IAM user (not root) and attach the policy in
   `iam-policy.json`. Generate an access key for it.
2. Generate a deploy SSH keypair (ed25519, no passphrase — it's used
   non-interactively by GitHub Actions):
   ```
   ssh-keygen -t ed25519 -f cricstate_deploy -C cricstate-ci -N ""
   ```
3. `cp terraform.tfvars.example terraform.tfvars` and paste the **public** key
   (`cricstate_deploy.pub`) into `ssh_public_key`.
4. Export the IAM user's credentials as env vars for this shell only (never
   written to a file):
   ```
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   ```
5. `terraform init`, `terraform plan` (review it), then `terraform apply`.
6. `terraform output` gives you the Elastic IP. Add to the GitHub repo's Actions
   secrets:
   - `EC2_SSH_PRIVATE_KEY` — contents of `cricstate_deploy` (the private key)
   - `EC2_HOST` — the Elastic IP from step 6

From here on, every push to `main` deploys automatically via
`.github/workflows/ci-cd.yml` — no AWS credentials are ever given to GitHub.

## Changing infrastructure later

Re-run `terraform plan`/`apply` with the same AWS credentials exported. State is
local (`terraform.tfstate`, gitignored) — back it up somewhere if you care about
being able to `terraform destroy`/modify later without re-importing resources.

## Tearing down

```
terraform destroy
```
