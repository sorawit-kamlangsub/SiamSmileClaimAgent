
# SSD Backend Init — ตั้งค่าโปรเจค .NET Core ใหม่จาก Template

## บริบท

ทุก Backend project เริ่มจาก `Net60_ApiTemplate_2023 release 202306` เท่านั้น Template อยู่ใน folder `src/` — ต้องย้ายออกมาที่ root ก่อน Jenkins จะ build ได้ เพราะ Jenkins อ่าน `.sln` จาก root ของ repo โดยตรง

**Template:** https://github.com/SiamsmileDev/Net60_ApiTemplate_2023/releases/tag/202306
**ตัวอย่างโปรเจคจริง:** https://github.com/SiamsmileDev/LineOAPASAdmin_API

## กฎหลัก

1. ดาวน์โหลดจาก release `202306` เท่านั้น — ห้าม clone branch หลักของ template
2. ต้องย้ายไฟล์ออกจาก `src/` ไปไว้ที่ root — Jenkins รัน `dotnet build` จาก root
3. ชื่อ folder, `.sln`, `.csproj` ต้องตรงกันทุกตัวอักษร — Jenkins reference ชื่อเหล่านี้
4. ต้อง replace namespace `Net60_ApiTemplate_2023` ให้ครบทุกไฟล์ก่อน build ครั้งแรก
5. `appsettings.json` ค่า `Project.CleanTitle` ต้องตรงกับที่ลงทะเบียนใน Auth Server

---

## ขั้นตอนที่ 0: เก็บข้อมูลโปรเจค (ถามก่อนเริ่มทุกครั้ง)

ใช้ **AskUserQuestion tool** ถามข้อมูลต่อไปนี้ก่อนดำเนินการใดๆ:

**ชุดที่ 1** — ข้อมูลพื้นฐาน:
- "ชื่อโปรเจค / Project Name (เช่น LineOAPA.Admin.API)" — header: "Project Name"
- "ชื่อ Database (เช่น LineOAPAS)" — header: "Database"
- "Port สำหรับ local development (เช่น 5010)" — header: "Dev Port"

**ชุดที่ 2** — ข้อมูล Auth:
- "Project.CleanTitle สำหรับ OAuth Audience (เช่น LineOAPAAdminAPI)" — header: "CleanTitle"
- "Database server พร้อมหรือยัง?" — header: "DB Server", options: ["พร้อมแล้ว — จะระบุ connection string", "ยังไม่มี — ใช้ (local) ไปก่อน"]

รวบรวมข้อมูลครบแล้วจึงดำเนินการขั้นตอนที่ 1 เป็นต้นไป

---

## ขั้นตอนที่ 1: ดาวน์โหลด Template

```bash
# ดาวน์โหลด release zip
# https://github.com/SiamsmileDev/Net60_ApiTemplate_2023/releases/tag/202306
# แตก zip → จะได้ folder: Net60_ApiTemplate_2023-202306/

# หรือ clone แล้วเลือก tag
git clone https://github.com/SiamsmileDev/Net60_ApiTemplate_2023.git temp-template
cd temp-template
git checkout tags/202306
```

---

## ขั้นตอนที่ 2: สร้าง Repo ใหม่และย้ายไฟล์

```bash
# สร้าง folder สำหรับโปรเจคใหม่
mkdir {ProjectName}
cd {ProjectName}
git init

# คัดลอกเนื้อหาจาก src/ ขึ้นมา root (ไม่เอา src/ wrapper)
# template structure: src/Net60_ApiTemplate_2023.sln
#                     src/Net60_ApiTemplate_2023/...
# target structure:   {ProjectName}.sln         ← root
#                     {ProjectName}/...          ← root

cp -r ../temp-template/src/. .
# ตอนนี้มี: Net60_ApiTemplate_2023.sln, Net60_ApiTemplate_2023/, Net60_ApiTemplate_2023.UnitTest/
```

---

## ขั้นตอนที่ 3: Rename ไฟล์และ Folder

> ⚠️ ชื่อต้องตรงกันทุกจุด — Jenkins ใช้ชื่อ `.sln` ในการ build

```bash
# Rename project folder
mv Net60_ApiTemplate_2023 {ProjectName}

# Rename .sln
mv Net60_ApiTemplate_2023.sln {ProjectName}.sln

# Rename .csproj ใน project folder
mv {ProjectName}/Net60_ApiTemplate_2023.csproj {ProjectName}/{ProjectName}.csproj

# Rename UnitTest (ถ้าใช้)
mv Net60_ApiTemplate_2023.UnitTest {ProjectName}.UnitTest
mv {ProjectName}.UnitTest/Net60_ApiTemplate_2023.UnitTest.csproj \
   {ProjectName}.UnitTest/{ProjectName}.UnitTest.csproj
```

---

## ขั้นตอนที่ 4: แก้ไข .sln ให้ชี้ไปที่ .csproj ใหม่

เปิด `{ProjectName}.sln` แล้วแทนที่:

```
# ก่อน:
Project("{FAE04EC0-...}") = "Net60_ApiTemplate_2023", "Net60_ApiTemplate_2023\Net60_ApiTemplate_2023.csproj"
Project("{FAE04EC0-...}") = "Net60_ApiTemplate_2023.UnitTest", "Net60_ApiTemplate_2023.UnitTest\Net60_ApiTemplate_2023.UnitTest.csproj"

# หลัง:
Project("{FAE04EC0-...}") = "{ProjectName}", "{ProjectName}\{ProjectName}.csproj"
Project("{FAE04EC0-...}") = "{ProjectName}.UnitTest", "{ProjectName}.UnitTest\{ProjectName}.UnitTest.csproj"
```

---

## ขั้นตอนที่ 5: Replace Namespace ทุกไฟล์ .cs

```bash
# Windows PowerShell
Get-ChildItem -Recurse -Filter "*.cs" | ForEach-Object {
    (Get-Content $_.FullName) -replace 'Net60_ApiTemplate_2023', '{ProjectName}' |
    Set-Content $_.FullName
}

# หรือ VS Code: Ctrl+Shift+H → Replace All in Files
# Find:    Net60_ApiTemplate_2023
# Replace: {ProjectName}
```

ตรวจสอบว่าแก้ครบใน:
- `using {ProjectName};` ทุกไฟล์
- `namespace {ProjectName}` ทุกไฟล์
- `Assembly.GetExecutingAssembly()` หรือ attribute ที่อ้าง namespace

---

## ขั้นตอนที่ 6: แก้ไข appsettings.json

```json
{
  "Project": {
    "Title": "{ProjectName}",
    "CleanTitle": "{ProjectCleanTitle}",
    "Description": "{Project Description}",
    "Version": "v1"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source={db-server};Initial Catalog={DatabaseName};User ID={user};Password={password};Trust Server Certificate=True;MultipleActiveResultSets=true;Encrypt=False;"
  },
  "OAuth": {
    "EnableOAuth": true,
    "Authority": "https://demoauthserver.devsiamsmile.com",
    "Audience": "{ProjectCleanTitle}",
    "Scopes": {
      "{ProjectCleanTitle}": "{ProjectName}",
      "roles": "User's role",
      "openid": "OpenId",
      "profile": "User's profile"
    }
  }
}
```

> ⚠️ `Project.CleanTitle` และ `OAuth.Audience` ต้องเป็นค่าเดียวกัน และตรงกับที่ลงทะเบียนใน Auth Server

---

## ขั้นตอนที่ 7: แก้ไข Properties/launchSettings.json

```json
{
  "profiles": {
    "IIS Express": { ... },
    "{ProjectName}": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "applicationUrl": "https://localhost:{port};http://localhost:{port-1}"
    }
  }
}
```

> ⚠️ Port ต้องไม่ชนกับ project อื่นในทีม — ถามหัวหน้างานก่อน assign port

---

## ขั้นตอนที่ 8: แก้ไข efpt.config.json (EF Core Reverse Engineer)

```json
{
  "ConnectionStrings": [
    "Data Source={db-server};Initial Catalog={DatabaseName};..."
  ],
  "Namespace": "{ProjectName}.Models",
  "ContextClassName": "AppDBContext",
  "OutputPath": "Models",
  "UseSchemaFolders": false
}
```

---

## ขั้นตอนที่ 9: Setup Git และ Push

```bash
git remote add origin https://github.com/SiamsmileDev/{ProjectName}.git
git add .
git commit -m "init: project from Net60_ApiTemplate_2023 (202306)"
git push -u origin develop
```

---

## ขั้นตอนที่ 10: ทดสอบ Build

```bash
dotnet build {ProjectName}.sln
# ต้องผ่าน Build succeeded — 0 Error(s)

dotnet run --project {ProjectName}/{ProjectName}.csproj
# เปิด https://localhost:{port}/swagger
```

---

## ⚠️ Jenkins Sensitive — ห้ามเปลี่ยน

| สิ่ง | เหตุผล |
|------|--------|
| ชื่อ `.sln` file | Jenkins รัน `dotnet build {Name}.sln` — ต้องอยู่ที่ root |
| ชื่อ project folder | ต้องตรงกับ `.csproj` — dotnet build ใช้ path นี้ |
| `Logs/` folder path | `appsettings.json` Serilog เขียน log ที่ `Logs/log.txt` |
| `appsettings.json` `Project.CleanTitle` | ใช้เป็น OAuth Audience — ต้องตรงกับ auth server |
| `.sln` ต้องอยู่ที่ root | Jenkins checkout แล้ว build จาก root — ถ้าอยู่ใน `src/` จะ fail |

---

## Checklist ก่อน Push ครั้งแรก

- [ ] ไม่มีไฟล์ที่มี namespace `Net60_ApiTemplate_2023` เหลืออยู่
- [ ] `{ProjectName}.sln` อยู่ที่ root ของ repo
- [ ] `dotnet build {ProjectName}.sln` ผ่าน 0 Error
- [ ] `appsettings.json` — Project.Title, CleanTitle, ConnectionString ถูกต้อง
- [ ] OAuth.Audience ตรงกับที่ auth server ลงทะเบียนไว้
- [ ] Port ใน launchSettings.json ไม่ชนกับ project อื่น
- [ ] git remote ชี้ไปที่ repo ใหม่แล้ว
- [ ] `.gitignore` ครอบคลุม `bin/`, `obj/`, `Logs/`, `*.user`
