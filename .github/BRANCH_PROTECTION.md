# Branch Protection Configuration

## 🛡️ Overview

This document outlines the recommended branch protection rules for StockFlow Pro to ensure code quality and prevent direct pushes to protected branches.

## 🔧 GitHub Branch Protection Setup

### **Main Branch Protection Rules**

Navigate to: `Settings > Branches > Add rule` for the `main` branch

#### **Required Settings**

1. **Branch name pattern**: `main`

2. **Protect matching branches**: ✅ Enabled

3. **Restrict pushes that create matching branches**: ✅ Enabled

4. **Require a pull request before merging**: ✅ Enabled
   - **Require approvals**: ✅ Enabled (minimum 1)
   - **Dismiss stale PR approvals when new commits are pushed**: ✅ Enabled
   - **Require review from code owners**: ✅ Enabled
   - **Restrict reviews to users with write access**: ✅ Enabled
   - **Allow specified actors to bypass required pull requests**: ❌ Disabled

5. **Require status checks to pass before merging**: ✅ Enabled
   - **Require branches to be up to date before merging**: ✅ Enabled
   - **Required status checks**:
     - `Automated Checks`
     - `PR Requirements Check`
     - `build` (if you have a build workflow)
     - `test` (if you have a test workflow)

6. **Require conversation resolution before merging**: ✅ Enabled

7. **Require signed commits**: ✅ Enabled (recommended)

8. **Require linear history**: ✅ Enabled (optional, prevents merge commits)

9. **Require deployments to succeed before merging**: ❌ Disabled (unless you have deployment checks)

10. **Lock branch**: ❌ Disabled

11. **Do not allow bypassing the above settings**: ✅ Enabled

12. **Restrict pushes that create matching branches**: ✅ Enabled

### **Development Branch Protection (Optional)**

If you use a `develop` or `dev` branch:

1. **Branch name pattern**: `develop` or `dev`
2. **Require a pull request before merging**: ✅ Enabled
   - **Require approvals**: ✅ Enabled (minimum 1)
3. **Require status checks to pass before merging**: ✅ Enabled
4. **Require conversation resolution before merging**: ✅ Enabled

## 🔄 Workflow Integration

### **Required Status Checks**

Ensure these workflows complete successfully before allowing merges:

```yaml
# From .github/workflows/pr-review.yml
- automated-checks
- pr-requirements
- auto-label
- assign-reviewers

# Additional checks you might add
- build
- test
- security-scan
- code-quality
```

### **Status Check Configuration**

In your repository settings:
1. Go to `Settings > Branches`
2. Edit the branch protection rule for `main`
3. Under "Require status checks to pass before merging"
4. Search for and add each required check

## 👥 Code Owners Integration

The `CODEOWNERS` file automatically assigns reviewers based on file changes:

```
# Global owners
* @your-username

# Critical components require specific reviewers
StockFlowPro.Domain/ @your-username @domain-expert
**/Security/ @your-username @security-expert
**/Migrations/ @your-username @database-expert
```

## 🚫 Bypass Permissions

### **Who Can Bypass Protection Rules**

**Recommended**: No one should bypass protection rules

**If bypass is necessary**:
- Repository administrators only
- Emergency hotfix scenarios
- Documented approval process required

### **Emergency Procedures**

1. **Document the emergency** in an issue
2. **Get approval** from team lead/architect
3. **Create hotfix branch** from main
4. **Minimal changes only**
5. **Immediate post-merge review**
6. **Follow-up PR** for proper review if needed

## 📋 Pre-merge Checklist

Before a PR can be merged, ensure:

- [ ] All required status checks pass
- [ ] At least one approving review
- [ ] Code owner approval (if applicable)
- [ ] All conversations resolved
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] PR template completed
- [ ] Tests pass locally and in CI

## 🔧 Local Development Workflow

### **Recommended Git Workflow**

1. **Create feature branch** from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push branch and create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create PR through GitHub UI
   ```

4. **Keep branch updated**:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main  # or git merge main
   git push --force-with-lease origin feature/your-feature-name
   ```

### **Commit Message Format**

Use conventional commits for automatic labeling:

```
feat: add user authentication
fix: resolve login validation issue
docs: update API documentation
style: format code according to standards
refactor: restructure user service
test: add unit tests for user controller
chore: update dependencies
perf: optimize database queries
security: fix SQL injection vulnerability
```

## 🚨 Troubleshooting Common Issues

### **Status Checks Not Appearing**

1. Ensure workflows are in `.github/workflows/`
2. Check workflow syntax with GitHub Actions validator
3. Verify workflow triggers include `pull_request`
4. Check repository permissions for GitHub Actions

### **Code Owner Reviews Not Required**

1. Verify `CODEOWNERS` file is in `.github/` directory
2. Check file syntax and user/team references
3. Ensure "Require review from code owners" is enabled
4. Verify code owners have repository access

### **Branch Protection Not Working**

1. Check branch name pattern matches exactly
2. Verify you have admin permissions to set rules
3. Ensure all required settings are enabled
4. Test with a test PR to verify rules work

### **Unable to Merge Despite Approvals**

1. Check all required status checks pass
2. Verify branch is up to date with main
3. Ensure all conversations are resolved
4. Check for merge conflicts

## 📊 Monitoring and Metrics

### **Branch Protection Metrics**

Track these metrics to ensure effectiveness:

- **PR merge time** - Time from creation to merge
- **Review coverage** - Percentage of PRs with proper reviews
- **Status check failures** - Common failure patterns
- **Bypass frequency** - How often rules are bypassed
- **Hotfix frequency** - Emergency merges to main

### **GitHub Insights**

Use GitHub's built-in insights:
- **Pulse** - Activity overview
- **Contributors** - Contribution patterns
- **Traffic** - Repository access patterns
- **Security** - Vulnerability alerts

## 🔄 Rule Updates and Maintenance

### **Regular Review Schedule**

- **Monthly**: Review bypass logs and exceptions
- **Quarterly**: Assess rule effectiveness
- **Semi-annually**: Update rules based on team growth
- **Annually**: Complete review of all protection settings

### **Rule Change Process**

1. **Propose changes** in team discussion
2. **Document rationale** for changes
3. **Test changes** on development branch first
4. **Communicate changes** to all team members
5. **Monitor impact** after implementation

## 📚 Additional Resources

### **GitHub Documentation**
- [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule)
- [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

### **Best Practices**
- [Git branching strategies](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Code review best practices](https://google.github.io/eng-practices/review/)
- [Conventional commits](https://www.conventionalcommits.org/)

---

## 📞 Support

For questions about branch protection:
- **Repository Admin**: @your-username
- **Team Lead**: @your-username
- **DevOps**: @your-username

---

*Last updated: 2024-01-01*
*Version: 1.0*