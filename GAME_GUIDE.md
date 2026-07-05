# 星之暗面 - SillyTavern 游戏资源包

一款基于 SillyTavern 的奇幻角色扮演游戏，包含 21 个精心设计的角色卡、完整世界书和游戏扩展系统。

## 游戏简介

欢迎来到星之暗面（Eldoria）—— 一个被永恒暮色笼罩的奇幻世界。在这里，你可以选择五大种族（人类、精灵、牛头人、哥布林、吸血鬼），探索神秘大陆，与独特角色互动，书写属于你的冒险传奇。

## 包含内容

- **21 个角色卡**（PNG 格式）：包括向导、各种族角色、玩家角色等
- **世界书**：星之暗面核心世界设定
- **MoonExtension 扩展**：游戏系统扩展（存档、属性、战斗、记忆）
- **配置模板**：预设 API 配置（需自行填入 API Key）

## 前置要求

1. **SillyTavern** >= 1.18.0（已安装并能正常运行）
2. **Node.js** >= 18.0.0
3. **API Key**：需要自备 OpenAI 兼容 API Key（推荐 [aiself.vip](https://aiself.vip)）

## 快速安装

### Windows 用户

1. 关闭 SillyTavern（如果正在运行）
2. 双击运行 `install.bat`
3. 启动 SillyTavern，开始游戏！

### macOS/Linux 用户

1. 关闭 SillyTavern
2. 打开终端，进入游戏资源包目录
3. 运行：`bash install.sh`
4. 启动 SillyTavern，开始游戏！

### 手动安装

如果自动安装失败，可以手动复制：

```
characters/          → 复制到 SillyTavern/data/default-user/characters/
world_info/          → 复制到 SillyTavern/data/default-user/world_info/
extensions/MoonExtension/  → 复制到 SillyTavern/data/default-user/extensions/MoonExtension/
```

## 配置 API

安装完成后，需要配置 API 才能开始游戏：

1. 打开 SillyTavern
2. 点击顶部 **🔌 API 连接** 图标
3. 选择 **Chat Completion** → **OpenAI 兼容**
4. 填入以下信息：
   - **API Key**：`你的 API Key`
   - **反向代理 URL**：`https://aiself.vip/v1`
   - **模型**：`kimi-for-coding`
5. 点击 **Connect**

### 重要配置项

由于 `kimi-for-coding` 模型的限制，必须设置以下参数：

| 参数 | 值 | 说明 |
|------|-----|------|
| Stream | **关闭** | 该模型不支持流式输出 |
| Presence Penalty | **0** | 非零值会导致 400 错误 |
| Frequency Penalty | **0** | 非零值会导致 400 错误 |

## 开始游戏

1. 启动 SillyTavern
2. 点击页面上的 **🎮 开始游戏** 按钮（紫色按钮）
3. 或手动：点击左侧「角色」→ 选择「星之暗面-向导」→ 点击「Start new chat」
4. 等待向导发送欢迎消息
5. 输入你的种族选择（如："牛头人"）
6. 开始你的冒险！

## 种族选择

游戏提供五大种族，每个种族有两个可选角色：

- **人类**（A/B）：均衡成长，适合新手
- **精灵**（C/D）：高敏捷，远程优势
- **牛头人**（E/F）：高力量，近战坦克
- **哥布林**（G/H）：高技巧，灵活多变
- **吸血鬼**（I/J）：暗属性，特殊能力

## 游戏功能

- **自动存档**：对话自动保存游戏进度
- **属性系统**：力量、敏捷、智力、体质四维属性
- **战斗系统**：回合制战斗
- **记忆系统**：AI 记住你的选择和故事发展
- **多结局**：不同选择导向不同结局

## 文件结构

```
SillyTavern-Game-Package/
├── characters/              # 21个角色卡（PNG格式）
│   ├── 星之暗面-向导.png
│   ├── 玩家.png
│   ├── 人类角色.png
│   ├── 精灵角色.png
│   ├── 牛头人角色.png
│   ├── 哥布林角色.png
│   ├── 吸血鬼角色.png
│   └── ...
├── world_info/              # 世界书
│   └── 星之暗面核心世界书.json
├── extensions/
│   └── MoonExtension/       # 游戏扩展
│       ├── index.js
│       ├── Moon_Core.js
│       ├── Moon_Memory.js
│       ├── Moon_Stats.js
│       ├── Moon_Combat.js
│       └── manifest.json
├── game-config.json           # 游戏配置模板
├── install.bat                # Windows 安装脚本
├── install.sh                 # macOS/Linux 安装脚本
└── README.md                  # 本文件
```

## 常见问题

### Q: 点击"开始游戏"按钮没反应？
A: 检查 MoonExtension 是否正确加载。打开浏览器控制台（F12），查看是否有错误信息。

### Q: 发送消息后没有回复？
A: 检查 API 连接状态：
- 确认 API Key 正确
- 确认 Stream 已关闭
- 确认 Penalty 值为 0
- 点击 API 配置中的 "Test Message" 测试连接

### Q: 角色列表中找不到"星之暗面-向导"？
A: 确保角色卡已正确复制到 `data/default-user/characters/` 目录，且 SillyTavern 已重启。

### Q: 可以分享给朋友吗？
A: 可以！本资源包已排除所有敏感信息（API Key）。朋友只需：
1. 安装 SillyTavern
2. 运行本资源包的安装脚本
3. 配置自己的 API Key

## 技术说明

### 模型兼容性

本游戏资源包已针对 `kimi-for-coding` 模型优化，但也兼容其他 OpenAI 兼容模型：

- **推荐**：`kimi-for-coding`（via aiself.vip）
- **兼容**：GPT-4、Claude、Gemini 等（需支持 function calling 或长上下文）

### 修改配置

高级用户可编辑 `game-config.json` 修改：
- 游戏名称和描述
- API 端点（如果你有其他 API 提供商）
- 模型名称

## 许可证

MIT License - 自由使用和分享

## 致谢

- [SillyTavern](https://github.com/SillyTavern/SillyTavern) - 优秀的 AI 角色扮演平台
- 所有角色设计灵感来源于经典奇幻 RPG

---

**遇到问题？** 请提交 Issue 或联系作者。

**祝游戏愉快！** 🎮✨
