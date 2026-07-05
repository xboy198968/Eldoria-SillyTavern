@echo off
chcp 65001 >nul
echo ========================================
echo   星之暗面 - 游戏资源安装程序
echo ========================================
echo.

REM 检查是否以管理员运行（可选）
REM 如果需要管理员权限，可以取消下面注释
REM net session >nul 2>&1
REM if %errorlevel% neq 0 (
REM     echo 请以管理员身份运行此脚本...
REM     pause
REM     exit /b
REM )

REM 获取 SillyTavern 数据目录
set "SILLYTAVERN_DATA=%~dp0..\SillyTavern\data\default-user"

REM 如果用户把资源包放在 SillyTavern 目录内，自动检测
if exist "..\data\default-user" (
    set "SILLYTAVERN_DATA=%~dp0..\data\default-user"
)

REM 如果不在 SillyTavern 目录内，询问用户
if not exist "%SILLYTAVERN_DATA%" (
    echo 未自动检测到 SillyTavern 数据目录。
    echo 请输入 SillyTavern 安装路径（例如: D:\GitHub\SillyTavern）:
    set /p SILLYTAVERN_PATH="路径: "
    set "SILLYTAVERN_DATA=%SILLYTAVERN_PATH%\data\default-user"
)

if not exist "%SILLYTAVERN_DATA%" (
    echo 错误: 找不到 SillyTavern 数据目录!
    echo 请确认 SillyTavern 已安装且路径正确。
    echo 默认路径: D:\GitHub\SillyTavern\data\default-user
    pause
    exit /b 1
)

echo 检测到 SillyTavern 数据目录:
echo   %SILLYTAVERN_DATA%
echo.

REM 备份现有角色卡（如果存在）
if exist "%SILLYTAVERN_DATA%\characters\星之暗面-向导.png" (
    echo 检测到已有星之暗面角色卡，创建备份...
    if not exist "%SILLYTAVERN_DATA%\characters_backup" mkdir "%SILLYTAVERN_DATA%\characters_backup"
    xcopy /Y /I "%SILLYTAVERN_DATA%\characters\星之暗面-向导.png" "%SILLYTAVERN_DATA%\characters_backup\" >nul 2>&1
    echo   备份已创建到: %SILLYTAVERN_DATA%\characters_backup
    echo.
)

REM 复制角色卡
echo [1/3] 安装角色卡...
if not exist "%SILLYTAVERN_DATA%\characters" mkdir "%SILLYTAVERN_DATA%\characters"
xcopy /Y /I "%~dp0characters\*.png" "%SILLYTAVERN_DATA%\characters\" >nul 2>&1
if %errorlevel% neq 0 (
    echo   错误: 角色卡复制失败!
    pause
    exit /b 1
)
echo   角色卡安装完成 ✓
echo.

REM 复制世界书
echo [2/3] 安装世界书...
if not exist "%SILLYTAVERN_DATA%\world_info" mkdir "%SILLYTAVERN_DATA%\world_info"
xcopy /Y /I "%~dp0world_info\*.json" "%SILLYTAVERN_DATA%\world_info\" >nul 2>&1
if %errorlevel% neq 0 (
    echo   错误: 世界书复制失败!
    pause
    exit /b 1
)
echo   世界书安装完成 ✓
echo.

REM 复制扩展
echo [3/3] 安装游戏扩展...
if not exist "%SILLYTAVERN_DATA%\extensions\MoonExtension" mkdir "%SILLYTAVERN_DATA%\extensions\MoonExtension"
xcopy /Y /I "%~dp0extensions\MoonExtension\*" "%SILLYTAVERN_DATA%\extensions\MoonExtension\" >nul 2>&1
if %errorlevel% neq 0 (
    echo   错误: 扩展复制失败!
    pause
    exit /b 1
)
echo   游戏扩展安装完成 ✓
echo.

REM 检查 API Key 配置
echo ========================================
echo   安装完成!
echo ========================================
echo.
echo 下一步操作:
echo   1. 启动 SillyTavern (Start.bat)
echo   2. 点击顶部 API 连接图标 (🔌)
echo   3. 配置 API Key 和模型:
echo      - 反向代理: https://aiself.vip/v1
echo      - 模型: kimi-for-coding
echo   4. 关闭 Stream, 设置 Penalty = 0
echo   5. 点击 "Connect" 连接 API
echo   6. 点击 "🎮 开始游戏" 按钮开始冒险!
echo.
echo 注意: 请确保你有有效的 API Key。
echo   没有 API Key? 访问 https://aiself.vip 获取
echo.
pause
