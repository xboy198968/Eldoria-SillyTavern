#!/bin/bash
# 星之暗面 - 游戏资源安装脚本 (macOS/Linux)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  星之暗面 - 游戏资源安装程序"
echo "========================================"
echo ""

# 检测 SillyTavern 数据目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 尝试自动检测
if [ -d "${SCRIPT_DIR}/../data/default-user" ]; then
    SILLYTAVERN_DATA="${SCRIPT_DIR}/../data/default-user"
elif [ -d "$HOME/SillyTavern/data/default-user" ]; then
    SILLYTAVERN_DATA="$HOME/SillyTavern/data/default-user"
else
    echo "未自动检测到 SillyTavern 数据目录。"
    read -p "请输入 SillyTavern 安装路径: " SILLYTAVERN_PATH
    SILLYTAVERN_DATA="${SILLYTAVERN_PATH}/data/default-user"
fi

if [ ! -d "$SILLYTAVERN_DATA" ]; then
    echo -e "${RED}错误: 找不到 SillyTavern 数据目录!${NC}"
    echo "请确认 SillyTavern 已安装。"
    exit 1
fi

echo "检测到 SillyTavern 数据目录:"
echo "  $SILLYTAVERN_DATA"
echo ""

# 备份
echo "[备份] 检查现有角色卡..."
if [ -f "${SILLYTAVERN_DATA}/characters/星之暗面-向导.png" ]; then
    BACKUP_DIR="${SILLYTAVERN_DATA}/characters_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp "${SILLYTAVERN_DATA}/characters/星之暗面-向导.png" "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "  ${GREEN}备份已创建: $BACKUP_DIR${NC}"
fi
echo ""

# 安装角色卡
echo "[1/3] 安装角色卡..."
mkdir -p "${SILLYTAVERN_DATA}/characters"
cp "${SCRIPT_DIR}/characters/"*.png "${SILLYTAVERN_DATA}/characters/" 2>/dev/null || {
    echo -e "${RED}错误: 角色卡复制失败!${NC}"
    exit 1
}
echo -e "  ${GREEN}角色卡安装完成 ✓${NC}"
echo ""

# 安装世界书
echo "[2/3] 安装世界书..."
mkdir -p "${SILLYTAVERN_DATA}/world_info"
cp "${SCRIPT_DIR}/world_info/"*.json "${SILLYTAVERN_DATA}/world_info/" 2>/dev/null || {
    echo -e "${RED}错误: 世界书复制失败!${NC}"
    exit 1
}
echo -e "  ${GREEN}世界书安装完成 ✓${NC}"
echo ""

# 安装扩展
echo "[3/3] 安装游戏扩展..."
mkdir -p "${SILLYTAVERN_DATA}/extensions/MoonExtension"
cp "${SCRIPT_DIR}/extensions/MoonExtension/"* "${SILLYTAVERN_DATA}/extensions/MoonExtension/" 2>/dev/null || {
    echo -e "${RED}错误: 扩展复制失败!${NC}"
    exit 1
}
echo -e "  ${GREEN}游戏扩展安装完成 ✓${NC}"
echo ""

# 完成
echo "========================================"
echo -e "  ${GREEN}安装完成!${NC}"
echo "========================================"
echo ""
echo "下一步操作:"
echo "  1. 启动 SillyTavern (./Start.sh)"
echo "  2. 点击顶部 API 连接图标 (🔌)"
echo "  3. 配置 API Key:"
echo "     - 反向代理: https://aiself.vip/v1"
echo "     - 模型: kimi-for-coding"
echo "  4. 关闭 Stream, 设置 Penalty = 0"
echo "  5. 点击 'Connect' 连接 API"
echo "  6. 点击 '🎮 开始游戏' 按钮开始冒险!"
echo ""
echo "注意: 请确保你有有效的 API Key。"
echo "  没有 API Key? 访问 https://aiself.vip 获取"
echo ""
