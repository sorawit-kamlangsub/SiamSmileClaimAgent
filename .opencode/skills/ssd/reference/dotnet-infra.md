
# SSD .NET Infrastructure — Logging, Background Jobs, API Clients

## บริบท

SSD ใช้ Serilog สำหรับ logging, Quartz สำหรับ background jobs (scheduled tasks), และ RestSharp สำหรับเรียก API ภายนอก ทั้งหมดต้องตั้งค่าใน `appsettings.json` และ register ใน `ProjectSetup.cs`

---

## ส่วนที่ 1: Logging ด้วย Serilog

### ระดับของ Log

| Level | ใช้เมื่อ |
|-------|---------|
| Verbose | Debug ละเอียดสูงสุด — ปิดใน Production |
| **Debug** | เข้า method ทุกครั้ง, อ่านข้อมูล |
| **Information** | บันทึก/แก้ไข/ลบข้อมูลสำเร็จ, สถานการณ์สำคัญ |
| Warning | อาจเกิดปัญหา แต่ยังทำงานได้ |
| Error | เกิดปัญหาที่แก้ไม่ได้ใน request ปัจจุบัน |
| Fatal | ความล้มเหลวร้ายแรง ต้องแก้ทันที |

### กฎการ Log

- ทุกครั้งที่เข้า method → Log **Debug** อย่างน้อย 1 ครั้ง
- เมื่อมีการเปลี่ยนแปลงข้อมูล → Log **Information** เมื่อสำเร็จ
- Log body ของ request/response → Log **Debug**
- **ห้าม** log ข้อมูลส่วนบุคคล (เลขบัตร, เบอร์โทร, รหัสผ่าน) ทุกกรณี
- หากจำเป็นต้อง log ข้อมูลส่วนบุคคล → ต้อง Mask ก่อนเสมอ

### วิธีเรียกใช้ Log

**วิธีที่ 1: เรียกโดยตรง**
```csharp
Log.Information("Created {@User} on {Created}", exampleUser, DateTime.Now);
Log.Debug("[{ServiceName}] GetAllAsync", _serviceName);
```

**วิธีที่ 2: Inject ผ่าน DI (แนะนำ — ทำ unit test ได้ง่าย)**
```csharp
public class MyService
{
    private readonly Serilog.ILogger _logger;
    private const string _serviceName = nameof(MyService);

    public MyService(Serilog.ILogger? logger = null)
    {
        _logger = logger?.ForContext("ServiceName", _serviceName)
                  ?? Serilog.Log.ForContext("ServiceName", _serviceName);
    }
}
```

### ForContext — เพิ่ม Property ให้ Log

```csharp
// เพิ่ม property คงที่ให้ logger
var log = _logger
    .ForContext("CollationId", Guid.NewGuid()) // สร้าง unique ID สำหรับ trace
    .ForContext("UserId", userId);

log.Information("[{ServiceName}] Start CreateAsync", _serviceName);
log.Debug("[{ServiceName}] Validate request", _serviceName);
// log ทุกบรรทัดจะมี CollationId และ UserId ติดมาด้วย
log.Information("[{ServiceName}] CreateAsync success", _serviceName);
```

### ตั้งค่า Serilog ใน appsettings.json

```json
"Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File", "Serilog.Sinks.Async"],
    "WriteTo": [
        {
            "Name": "MSSqlServer",
            "Args": {
                "connectionString": "Data Source=(local);..."
            }
        }
    ],
    "Properties": {
        "Application": "MyProjectApi"
    }
}
```

---

## ส่วนที่ 2: Background Jobs ด้วย Quartz

### ขั้นตอนที่ 1: สร้าง Job Class

สร้างไฟล์ใน `HostedServices/` ชื่อลงท้ายด้วย `Job.cs`:

```csharp
// HostedServices/BatchJob.cs
namespace MyProject.HostedServices
{
    [DisallowConcurrentExecution] // ป้องกันการทำงานซ้อนกัน
    public class BatchJob : IJob
    {
        private readonly IMyService _service;

        public BatchJob(IMyService service)
        {
            _service = service;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            // งานที่จะทำ
            await _service.DoSomethingAsync();
        }
    }
}
```

### ขั้นตอนที่ 2: ตั้งค่า Cron Expression ใน appsettings.json

```json
"Quartz": {
    "EnableQuartz": true,
    "Jobs": {
        "BatchJob": "0 0 * ? * *",
        "SyncUserJob": "0 0 9,16 ? * * *",
        "LoggerRetentionJob": "0 0 0 * * ?"
    }
}
```

**รูปแบบ Cron Expression (7 ส่วน):**

| วินาที | นาที | ชั่วโมง | วันของเดือน | เดือน | วันของสัปดาห์ | ปี |
|--------|------|---------|-------------|-------|--------------|-----|
| 0-59   | 0-59 | 0-23    | 1-31 หรือ ? | 1-12  | 1-7 หรือ ?   | ว่างได้ |

ตัวอย่าง Cron:
- `0 0 * ? * *` — ทุกชั่วโมง
- `0 0 9,16 ? * * *` — ทุกวัน 09:00 และ 16:00
- `0 0 0 * * ?` — ทุกคืนเที่ยงคืน
- `0 0 8,14 * * *` — ทุกวัน 08:00 และ 14:00

> ใช้ https://www.freeformatter.com/cron-expression-generator-quartz.html สำหรับช่วยสร้าง Cron expression

### ขั้นตอนที่ 3: Register Job ใน ProjectSetup.cs

```csharp
public static IServiceCollectionQuartzConfigurator ConfigQuartz(
    this IServiceCollectionQuartzConfigurator q,
    QuartzSetting quartzSetting)
{
    q.AddJobAndTrigger<BatchJob>(quartzSetting);
    q.AddJobAndTrigger<SyncUserJob>(quartzSetting);
    q.AddJobAndTrigger<LoggerRetentionJob>(quartzSetting);
    return q;
}
```

---

## ส่วนที่ 3: RestSharp API Client

### ขั้นตอนที่ 1: สร้าง Base Client Class

สร้างไฟล์ใน `Clients/` ชื่อลงท้ายด้วย `Client.cs`:

```csharp
// Clients/ExternalApiClient.cs
public class ExternalApiClient
{
    private readonly RestClient _client;
    private readonly ExternalApiSetting _setting;

    public ExternalApiClient(IOptions<ExternalApiSetting> options)
    {
        _setting = options.Value;

        var restOptions = new RestClientOptions(_setting.BaseApiUrl);
        var jsonSetting = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
            NullValueHandling = NullValueHandling.Ignore
        };

        _client = new RestClient(
            restOptions,
            configureSerialization: s => s.UseNewtonsoftJson(jsonSetting));

        // กรณีต้องส่ง Authorization Header ทุก request
        _client.AddDefaultHeader("Authorization", $"Bearer {_setting.Token}");
    }

    private const string _getEndpoint = "/api/data";

    public async Task<DataResponseDto> GetDataAsync()
    {
        var request = new RestRequest(_getEndpoint);
        request.AddQueryParameter("page", "1");
        return await _client.GetAsync<DataResponseDto>(request);
    }

    private const string _postEndpoint = "/api/data";

    public async Task<DataResponseDto> PostDataAsync(DataRequestDto requestDto)
    {
        var request = new RestRequest(_postEndpoint);
        request.AddJsonBody(requestDto);
        return await _client.PostAsync<DataResponseDto>(request);
    }
}
```

### ขั้นตอนที่ 2: สร้าง Sub-Client สำหรับแต่ละ endpoint กลุ่ม

```csharp
public class UserApiClient : ExternalApiClient
{
    public UserApiClient(IOptions<ExternalApiSetting> options) : base(options) { }

    public async Task<UserDto> GetUserAsync(int userId)
    {
        var request = new RestRequest($"/api/users/{userId}");
        return await _client.GetAsync<UserDto>(request);
    }
}
```

### ขั้นตอนที่ 3: Register ใน ProjectSetup.cs

```csharp
services.AddSingleton<ExternalApiClient>();
services.AddSingleton<UserApiClient>();
```

### Authorization ด้วย RestSharp

**Basic Auth:**
```csharp
var options = new RestClientOptions("https://example.com")
{
    Authenticator = new HttpBasicAuthenticator("username", "password")
};
```

**JWT Auth:**
```csharp
var options = new RestClientOptions("https://example.com")
{
    Authenticator = new JwtAuthenticator("your-jwt-token")
};
```

**Custom Authenticator (เมื่อต้อง refresh token อัตโนมัติ):**
```csharp
public class MyAuthenticator : AuthenticatorBase
{
    private readonly MyApiSetting _setting;
    private DateTime _tokenExpiration;
    private SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

    public MyAuthenticator(MyApiSetting setting) : base("")
    {
        _setting = setting;
        Token = string.Empty;
    }

    protected override async ValueTask<Parameter> GetAuthenticationParameter(string accessToken)
    {
        // เช็ค token หมดอายุหรือไม่ และขอใหม่ถ้าจำเป็น
        if (string.IsNullOrEmpty(Token) || DateTime.UtcNow.AddMinutes(5) >= _tokenExpiration)
            await CheckTokenExpired();

        return new HeaderParameter(KnownHeaders.Authorization, Token);
    }

    private async Task CheckTokenExpired()
    {
        await _lock.WaitAsync(); // ป้องกัน race condition
        try
        {
            if (string.IsNullOrEmpty(Token) || DateTime.UtcNow.AddMinutes(5) >= _tokenExpiration)
                await RefreshToken();
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task RefreshToken()
    {
        // ยิง API ขอ token ใหม่
        var client = new RestClient(_setting.LoginEndpoint);
        var request = new RestRequest();
        request.AddJsonBody(_setting.Credentials);

        var response = await client.ExecutePostAsync<TokenResponse>(request);
        if (response.IsSuccessful)
        {
            Token = $"Bearer {response.Data?.AccessToken}";
            _tokenExpiration = DateTime.UtcNow.AddSeconds(response.Data?.ExpiresIn ?? 0);
        }
    }
}
```

### ข้อควรรู้เกี่ยวกับ RestSharp

- **Auto Deserialize:** `GetAsync<T>()`, `PostAsync<T>()` จะ deserialize ให้อัตโนมัติ
- **Error Handling:** `GetAsync<T>()`, `PostAsync<T>()` จะ throw Exception เมื่อเกิด error → ต้อง try/catch
- **ExecuteAsync():** ไม่ throw Exception → ต้องเช็ค `response.IsSuccessful` เอง
- **HttpClientPool:** RestSharp จัดการ pool ให้อัตโนมัติจาก BaseUrl — ไม่ต้อง dispose client

### Option Pattern สำหรับ Configuration

```json
// appsettings.json
"ExternalApi": {
    "BaseApiUrl": "https://api.example.com",
    "Token": "static-token-here"
}
```

```csharp
// Configurations/ExternalApiSetting.cs
public class ExternalApiSetting
{
    public const string Section = "ExternalApi";
    public string BaseApiUrl { get; set; }
    public string Token { get; set; }
}

// ProjectSetup.cs
services.Configure<ExternalApiSetting>(
    Configuration.GetSection(ExternalApiSetting.Section));
```
