# 健康 · 体重与轻断食

本地开发：`npm install` → `npm run dev`（仅改代码时需要）。

## 放到 GitHub 上的 `life` 仓库 + 在线访问

在 GitHub 里「一个叫 life 的文件夹」对应的是：**仓库名设为 `life`**（你电脑上的项目文件夹叫什么都可以，例如仍是 `health-app`）。

1. 登录 GitHub → **New repository** → **Repository name** 填 **`life`** → 创建（可先不要勾选自动添加 README，避免首次推送冲突）。
2. 在本机进入本项目目录，执行（把 `YOUR_USERNAME` 换成你的 GitHub 用户名）：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/life.git
git push -u origin main
```

若 GitHub 上创建仓库时已经带了 README，先执行：`git pull origin main --allow-unrelated-histories`，解决冲突后再 `git push`。

3. 打开 **`life` 仓库** → **Settings → Pages** → **Build and deployment** → **Source** 选 **GitHub Actions**。
4. 等 **Actions** 里部署成功，网站地址为：

   **`https://YOUR_USERNAME.github.io/life/`**

之后改代码再 `git push`，会自动重新部署。手机/电脑用浏览器打开上述网址即可，**不必**在本地跑 `npm run dev`。

> 部署路径会自动用仓库名：`/life/`，与 CI 里的 `BASE_PATH` 一致。
