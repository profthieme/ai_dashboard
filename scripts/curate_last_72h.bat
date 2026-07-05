@echo off
REM Quick curation script wrapper for Windows
REM Usage: curate_last_72h.bat [ai-business|ai-education|ai-tech|all]
REM Example: curate_last_72h.bat ai-business

SET TOPIC=%1
IF "%TOPIC%"=="" SET TOPIC=all

CD /D %~dp0

IF "%TOPIC%"=="all" (
    echo Curating all topics from last 72 hours...
    python scripts\curate_reliable.py --hours 72 --show-articles
) ELSE (
    echo Curating %TOPIC% from last 72 hours...
    python scripts\curate_reliable.py --topic %TOPIC% --hours 72 --show-articles
)

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo Ready to commit? (Y/N)
    SET /P CONFIRM=
    IF /I "%CONFIRM%"=="Y" (
        git add data\news.json
        git commit -m "Curated articles: %TOPIC% last 72h (%DATE%)"
        git push
        echo.
        echo Dashboard will update at: https://profthieme.github.io/ai_dashboard/
    )
)