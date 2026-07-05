# 星之暗面 游戏资源包

## 简介

《星之暗面》（Eldoria）是一款基于 SillyTavern 的奇幻角色扮演游戏。本仓库包含游戏运行所需的所有资源文件。

## 快速开始

### 前提条件

- [SillyTavern](https://github.com/SillyTavern/SillyTavern) 已安装
- 有效的 OpenAI 兼容 API Key（推荐 [aiself.vip](https://aiself.vip)）

### 安装步骤

**Windows:**
```bash
# 1. 下载本仓库
# 2. 解压到任意位置
# 3. 双击运行 install.bat
# 4. 按照提示完成安装
```

**macOS/Linux:**
```bash
# 1. 下载本仓库
git clone https://github.com/你的用户名/星之暗面.git
cd 星之暗面

# 2. 运行安装脚本
bash install.sh
```

### 配置 API

安装完成后，启动 SillyTavern 并配置 API：

| 设置项 | 值 |
|--------|-----|
| API 类型 | Chat Completion (OpenAI 兼容) |
| 反向代理 | `https://aiself.vip/v1` |
| 模型 | `kimi-for-coding` |
| Stream | **关闭** |
| Presence Penalty | **0** |
| Frequency Penalty | **0** |

> ⚠️ **重要**：`kimi-for-coding` 模型不支持流式输出，且 penalty 必须设为 0。

## 开始游戏

1. 启动 SillyTavern
2. 点击页面上的 🎮 **开始游戏** 按钮
3. 或手动：角色 → 选择「星之暗面-向导」→ Start new chat
4. 选择种族（人类/精灵/牛头人/哥布林/吸血鬼）
5. 开始冒险！

## 仓库内容

```
.
├── characters/          # 21 个角色卡（PNG）
├── world_info/          # 世界书设定
├── extensions/          # MoonExtension 游戏扩展
├── install.bat          # Windows 安装脚本
├── install.sh           # macOS/Linux 安装脚本
├── game-config.json     # 游戏配置模板
└── README.md            # 说明文档
```

## 注意事项

- **API Key 安全**：本仓库不包含任何 API Key。安装后需自行配置。
- **备份**：安装脚本会自动备份已有角色卡。
- **兼容性**：支持 SillyTavern >= 1.18.0

## 许可证

MIT License
