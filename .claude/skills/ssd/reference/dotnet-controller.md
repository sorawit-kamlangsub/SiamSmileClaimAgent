
# SSD .NET Controller — มาตรฐานการเขียน API Controller

## บริบท

Controller ของ SSD เป็น ASP.NET Core Controller ที่ทำหน้าที่รับ HTTP request และส่งต่อไปยัง Service layer ทุก method ต้องคืนค่าเป็น `ServiceResponse` ผ่าน `ResponseResult` และต้องมี permission check เมื่อจำเป็น

## กฎหลัก

1. Route ต้องขึ้นต้นด้วย `api/` ตามด้วยชื่อ controller ตัวพิมพ์เล็ก ใช้ `-` แทน space
2. ทุก HTTP method attribute ต้องกำหนด `Name` ด้วยเสมอ
3. ต้อง return ด้วย `ResponseResult` และ `ServiceResponse` ทุกครั้ง (ยกเว้นกรณีที่ return ไม่ใช่ JSON)
4. ต้องใส่ XML comment สำหรับทุก method ถ้าเป็นไปได้
5. Method ที่อ่านข้อมูล — Log ระดับ Debug อย่างน้อย 1 ครั้ง
6. Method ที่เปลี่ยนแปลงข้อมูล — Log ระดับ Information และเก็บ body ทั้งหมด
7. ใช้ `ClaimPermission` attribute เมื่อต้องการจำกัดสิทธิ์
8. **ห้ามใช้ `[HttpPut]`, `[HttpPatch]`, `[HttpDelete]`** — มาตรฐานบริษัทใช้ REST API (ไม่ใช่ RESTful) คือมีแค่ `GET` กับ `POST` เท่านั้น การ update/delete ให้ใช้ `[HttpPost]` พร้อม action suffix ต่อท้าย route เช่น `{id}/update`, `{id}/delete`
9. **ห้าม hardcode OAuth Scope/Audience** — ถ้าโค้ดต้องอ้างอิงค่า Scope/Audience (Swagger OAuth2 definition, policy ตรวจ scope claim) ต้องอ่านค่าจริงจาก `appsettings.json` ของโปรเจคนั้นเสมอ ห้ามก็อปค่าจาก template หรือโปรเจคอื่น (เช่น `net60_apitemplate_2023`) ถ้ายังไม่มีค่าจริง (appsettings.json ยังไม่ตั้งค่า OAuth หรือเขียนโค้ดตัวอย่างเดี่ยวๆ) ให้ fallback เป็น `demo_pos`

## โครงสร้าง Controller มาตรฐาน

```csharp
namespace MyProject.Controllers
{
    // Route ขึ้นต้นด้วย api/ ตามด้วยชื่อ controller ตัวเล็ก ใช้ - แทน space
    [Route("api/call-result")]
    [ApiController]
    [Authorize] // ต้อง login ก่อนเข้าถึง controller นี้ทั้งหมด
    public class CallResultController : ControllerBase
    {
        private readonly ICallResultService _service;
        private readonly Serilog.ILogger _logger;
        private const string _controllerName = nameof(CallResultController);

        // Inject service และ logger ผ่าน constructor
        public CallResultController(
            ICallResultService service,
            Serilog.ILogger? logger = null)
        {
            _service = service;
            // logger optional เพื่อให้ทำ unit test ได้ง่าย
            _logger = logger is null
                ? Serilog.Log.ForContext("ControllerName", _controllerName)
                : logger.ForContext("ControllerName", _controllerName);
        }

        /// <summary>
        /// Get all call results
        /// </summary>
        /// <param name="paginationDto">Pagination parameters</param>
        /// <param name="filter">Filter criteria</param>
        /// <remarks>
        /// Agent: สามารถดูได้เฉพาะของตัวเอง
        /// Team Lead: สามารถดูของสมาชิกทีม
        /// Manager/Admin: สามารถดูทั้งหมด
        /// </remarks>
        [HttpGet(Name = "CallResultGetAll")] // ต้องมี Name ทุกครั้ง
        public async Task<ServiceResponse<List<CallResultTableDto>>?> GetAll(
            [FromQuery] PaginationDto paginationDto,
            [FromQuery] CallResultFilterDto filter,
            CancellationToken cancellationToken = default)
        {
            _logger.Debug("[{ControllerName}] GetAll", _controllerName);
            var response = await _service.GetAllAsync(paginationDto, filter, cancellationToken);
            var pagination = await _service.GetPaginationAsync(paginationDto, filter, cancellationToken);
            return ResponseResult.Success(response, pagination, "Get all call result success");
        }

        [HttpGet("{callResultId}", Name = "CallResultGetById")]
        public async Task<ServiceResponse<CallResultResponseDto?>> GetById(
            int callResultId,
            CancellationToken cancellationToken = default)
        {
            _logger.Debug("[{ControllerName}] GetById", _controllerName);
            var response = await _service.GetByIdAsync(callResultId, cancellationToken);
            if (response is null)
                return ResponseResult.NotFound<CallResultResponseDto>(
                    $"Call result id {callResultId} not found");
            return ResponseResult.Success(response, $"Get call result by id {callResultId} success");
        }

        // ใช้ ClaimPermission เมื่อต้องการจำกัดสิทธิ์เฉพาะ method
        [HttpPost(Name = "CallResultCreate")]
        [ClaimPermission(Permission.Admin, Permission.Manager)]
        public async Task<ServiceResponse<CallResultResponseDto>> Create(
            [FromBody] CallResultRequestDto request,
            CancellationToken cancellationToken = default)
        {
            _logger.Debug("[{ControllerName}] Create", _controllerName);
            var response = await _service.CreateAsync(request, cancellationToken);
            // Log Information เมื่อมีการเปลี่ยนแปลงข้อมูล
            _logger.Information(
                "[{ControllerName}] Create success, id {CallResultId}",
                _controllerName, response.CallResultId);
            // Log Debug สำหรับ response body (ไม่จำเป็นต้องทำทุก method)
            _logger.Debug(
                "[{ControllerName}] Create response {@Response}",
                _controllerName, response);
            return ResponseResult.Success(response, "Create call result success");
        }

        // Update/Delete ใช้ HttpPost เสมอ — ห้ามใช้ HttpPut/HttpPatch/HttpDelete
        [HttpPost("{callResultId}/update", Name = "CallResultUpdate")]
        [ClaimPermission(Permission.Admin, Permission.Manager)]
        public async Task<ServiceResponse<CallResultResponseDto?>> Update(
            int callResultId,
            [FromBody] CallResultRequestDto request,
            CancellationToken cancellationToken = default)
        {
            _logger.Debug("[{ControllerName}] Update [{CallResultId}]", _controllerName, callResultId);
            var response = await _service.UpdateAsync(callResultId, request, cancellationToken);
            if (response is null)
                return ResponseResult.NotFound<CallResultResponseDto>(
                    $"Call result id {callResultId} not found");
            _logger.Information(
                "[{ControllerName}] Update success [{CallResultId}]",
                _controllerName, callResultId);
            return ResponseResult.Success(response, $"Update call result {callResultId} success");
        }

        [HttpPost("{callResultId}/delete", Name = "CallResultDelete")]
        [ClaimPermission(Permission.Admin)]
        public async Task<ServiceResponse<CallResultResponseDto?>> Delete(
            int callResultId,
            CancellationToken cancellationToken = default)
        {
            _logger.Debug("[{ControllerName}] Delete [{CallResultId}]", _controllerName, callResultId);
            var response = await _service.DeleteAsync(callResultId, cancellationToken);
            if (response is null)
                return ResponseResult.NotFound<CallResultResponseDto>(
                    $"Call result id {callResultId} not found");
            _logger.Information(
                "[{ControllerName}] Delete success [{CallResultId}]",
                _controllerName, callResultId);
            return ResponseResult.Success(response, $"Delete call result {callResultId} success");
        }
    }
}
```

## Authorization ด้วย Permission

### ตั้งค่า Permission.cs
```csharp
public class Permission
{
    public const string Admin = "call_result_api:admin";
    public const string Manager = "call_result_api:manager";
    public const string Agent = "call_result_api:agent";

    public static AuthorizationPolicy AdminPermission =
        new AuthorizationPolicyBuilder()
            .RequireClaim("permission", Admin)
            .Build();
}
```

### ขั้นตอนการตั้งค่า Permission
1. ปรึกษา Dev Lead เพื่อสร้าง Google Sheet สำหรับ API Registration
2. Copy ข้อมูลจาก Sheet ไปยัง `appsettings.json` และ `Permission.cs`

## OAuth Scope (เมื่อ `OAuth.EnableOAuth: true`)

ถ้าโปรเจคเปิดใช้ OAuth (`appsettings.json` → `OAuth.EnableOAuth: true`) และต้องเขียนโค้ดที่อ้างอิง Scope/Audience เช่น Swagger OAuth2 security definition หรือ policy ที่ตรวจ scope claim:

1. **อ่านค่าจริงจาก `appsettings.json` ของโปรเจคนั้นเสมอ** — `OAuth.Audience` และ key แรกใน `OAuth.Scopes` คือค่าที่ต้องใช้ ห้าม hardcode ค่าจาก template (`net60_apitemplate_2023`) หรือจากโปรเจคอื่น เพราะแต่ละโปรเจคมีค่าต่างกัน
2. **ถ้าไม่มี `appsettings.json` ให้อ่าน หรือยังไม่ได้ลงทะเบียน OAuth จริง** (เช่น เขียนโค้ดตัวอย่างเดี่ยวๆ หรือโปรเจคใหม่ที่ยังไม่ผูก auth server) — ใช้ `demo_pos` เป็นค่า fallback (scope สำหรับ demo auth server `https://demoauthserver.devsiamsmile.com`)

ตัวอย่าง Swagger OAuth2 security definition — ค่า Scope มาจาก config เสมอ ไม่ hardcode ในโค้ด:
```csharp
c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
{
    Type = SecuritySchemeType.OAuth2,
    Flows = new OpenApiOAuthFlows
    {
        Implicit = new OpenApiOAuthFlow
        {
            AuthorizationUrl = new Uri($"{builder.Configuration["OAuth:Authority"]}/connect/authorize"),
            // Scopes มาจาก appsettings.json — ห้าม hardcode ค่า key เอง
            Scopes = builder.Configuration.GetSection("OAuth:Scopes").Get<Dictionary<string, string>>()
        }
    }
});
```

## Route Naming Convention

| รูปแบบ | ตัวอย่าง |
|--------|----------|
| Controller route | `api/call-result` |
| Get all | `[HttpGet(Name = "CallResultGetAll")]` |
| Get by id | `[HttpGet("{id}", Name = "CallResultGetById")]` |
| Create | `[HttpPost(Name = "CallResultCreate")]` |
| Update | `[HttpPost("{id}/update", Name = "CallResultUpdate")]` |
| Delete | `[HttpPost("{id}/delete", Name = "CallResultDelete")]` |

> มาตรฐานบริษัทใช้ REST API (ไม่ใช่ RESTful) — มี HTTP method แค่ `GET` และ `POST` เท่านั้น ห้ามใช้ `PUT`, `PATCH`, `DELETE` ไม่ว่ากรณีใด

## Logging Guidelines ใน Controller

| สถานการณ์ | Log Level |
|-----------|-----------|
| เข้า method ทุกครั้ง | Debug |
| อ่านข้อมูล (GET) | Debug |
| เปลี่ยนแปลงข้อมูล (POST) — สำเร็จ | Information |
| Log body ของ request/response | Debug |
| ข้อมูลส่วนบุคคล | **ห้าม** log ทุกกรณี |
