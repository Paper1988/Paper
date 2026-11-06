# Security Policy

## Supported Versions

Paper has no tagged releases. Only the latest commit on the `main` branch receives security fixes.

| Version         | Supported          |
| --------------- | ------------------- |
| `main` (latest) | :white_check_mark: |
| Anything else   | :x:                |

## Reporting a Vulnerability

Please do not report security issues through public issues, pull requests, or discussions.

Use GitHub's private vulnerability reporting: open the **Security** tab of this repository and click **Report a vulnerability**. If that is unavailable, email ericliu8888824@gmail.com.

Please include:

- What the issue is and what an attacker could do with it
- Steps to reproduce
- The affected commit

Do not include real bot tokens, database or Redis connection strings, or other live credentials in your report, screenshots, or logs. Redact them first. If you find a credential that has been exposed in this repository or its history, report it the same way and I will rotate it.

## Scope

In scope:

- Authentication or authorization problems in the Fastify HTTP API
- Request validation issues, including injection into MongoDB queries
- Commands or interactions that let a user act beyond their Discord permissions
- Exposure of secrets, user data, or server data
- Vulnerable dependencies that are exploitable in how this project uses them

Out of scope:

- Misconfiguration in self-hosted or forked deployments, since independent deployments are not supported
- Vulnerabilities in Discord, Railway, MongoDB, Redis, or other third-party services themselves
- Abuse of public bot commands that has no security impact
- Findings that require an already compromised Discord account or machine

## What to Expect

- Acknowledgement within 7 days
- A status update at least every 14 days until the report is resolved
- If accepted, a fix on `main` and credit in the commit or advisory unless you prefer to stay anonymous
- If declined, an explanation of why
