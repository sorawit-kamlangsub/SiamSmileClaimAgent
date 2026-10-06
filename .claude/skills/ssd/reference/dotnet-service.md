
# SSD .NET Service — มาตรฐานการเขียน Service, DTO และ AutoMapper

## บริบท

Service layer ของ SSD มีหน้าที่จัดการ business logic ทั้งหมด ทุก service ต้องมี interface คู่กัน และใช้ Dependency Injection ในการ inject DbContext, IMapper, และ ILoginDetailServices มี AutoMapper สำหรับ map ระหว่าง Model และ DTO

## กฎหลัก

1. ต้องสร้าง interface ของ service ทุกครั้ง
2. ต้องใช้ Dependency Injection — ห้าม new class ใน service
3. ต้อง inject DbContext, IMapper เป็นพื้นฐาน และ ILoginDetailServices เมื่อต้องการข้อมูล user
4. DTO naming: ลงท้ายด้วย `Dto` และมี suffix เพิ่มตาม use case
5. ต้องใช้ AutoMapper ผ่าน `AutoMapperProfile.cs` ห้ามใช้ MappingExtension class

## ขั้นตอนการสร้าง Service

### ขั้นตอนที่ 1: สร้าง Interface

```csharp
// ICallResultService.cs
public interface ICallResultService
{
    Task<List<CallResultTableDto>> GetAllAsync(
        PaginationDto paginationDto,
        CallResultFilterDto filter = null,
        CancellationToken cancellationToken = default);

    Task<PaginationResultDto> GetPaginationAsync(
        PaginationDto paginationDto,
        CallResultFilterDto filter = null,
        CancellationToken cancellationToken = default);

    Task<CallResultResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CallResultResponseDto> CreateAsync(
        CallResultRequestDto request,
        CancellationToken cancellationToken = default);

    Task<CallResultResponseDto?> UpdateAsync(
        int id,
        CallResultRequestDto request,
        CancellationToken cancellationToken = default);

    Task<CallResultResponseDto?> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
```

### ขั้นตอนที่ 2: สร้าง Service Implementation

```csharp
// CallResultService.cs
public class CallResultService : ICallResultService
{
    private readonly AppDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ILoginDetailServices _login;
    private readonly Serilog.ILogger _logger;
    private const string _serviceName = nameof(CallResultService);

    // Inject DbContext + IMapper เสมอ
    // Inject ILoginDetailServices เฉพาะ service ที่ต้องการข้อมูล user
    public CallResultService(
        AppDbContext dbContext,
        IMapper mapper,
        ILoginDetailServices login,
        Serilog.ILogger? logger = null)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _login = login;
        _logger = logger is null
            ? Serilog.Log.ForContext("ServiceName", _serviceName)
            : logger.ForContext("ServiceName", _serviceName);
    }

    // Filter helper method
    private IQueryable<CallResult> FilterByDto(
        IQueryable<CallResult> query,
        CallResultFilterDto filter)
    {
        _logger.Debug("[{ServiceName}] FilterByDto {@Filter}", _serviceName, filter);

        if (filter.CallResultId is not null)
            query = query.Where(x => x.CallResultId == filter.CallResultId);

        if (filter.AgentId is not null)
            query = query.Where(x => x.AgentId == filter.AgentId);

        return query;
    }

    public async Task<List<CallResultTableDto>> GetAllAsync(
        PaginationDto paginationDto,
        CallResultFilterDto filter = null,
        CancellationToken cancellationToken = default)
    {
        _logger.Debug("[{ServiceName}] GetAllAsync", _serviceName);

        var query = _dbContext.CallResults
            .AsNoTracking()
            .AsQueryable();

        if (filter is not null)
            query = FilterByDto(query, filter);

        if (paginationDto.SortBy is not null)
            query = query.OrderBy($"{paginationDto.SortBy} {paginationDto.SortOrder}");

        // ใช้ ProjectTo แทนการ Map ทีหลัง — ลด memory usage
        var result = await query
            .Paginate(paginationDto)
            .ProjectTo<CallResultTableDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        _logger.Debug("[{ServiceName}] GetAllAsync result", _serviceName);
        return result;
    }

    public async Task<CallResultResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        _logger.Debug("[{ServiceName}] GetByIdAsync [Id={Id}]", _serviceName, id);

        return await _dbContext.CallResults
            .AsNoTracking()
            .Where(cr => cr.CallResultId == id)
            .ProjectTo<CallResultResponseDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CallResultResponseDto> CreateAsync(
        CallResultRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // ดึงข้อมูล user จาก ILoginDetailServices
        var user = _login.GetClaim();
        var userId = user.UserId;
        var now = DateTime.Now;

        // ForContext สำหรับ trace operation ที่ซับซ้อน
        var log = _logger
            .ForContext("CollationId", Guid.NewGuid())
            .ForContext("UserId", userId);

        log.Debug("[{ServiceName}] CreateAsync [UserId={UserId}]", _serviceName, userId);

        var entity = _mapper.Map<CallResult>(request);
        entity.CreatedByUserId = userId;
        entity.CreatedDate = now;
        entity.UpdatedByUserId = userId;
        entity.UpdatedDate = now;

        _dbContext.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Log Information เมื่อสำเร็จ
        log.Information(
            "[{ServiceName}] CreateAsync successfully [UserId={UserId}, CallResultId={Id}]",
            _serviceName, userId, entity.CallResultId);

        return _mapper.Map<CallResultResponseDto>(entity);
    }
}
```

### ขั้นตอนที่ 3: Register ใน ProjectSetup.cs

```csharp
public void ConfigDependency(IServiceCollection services)
{
    services.AddScoped<ICallResultService, CallResultService>();
    // เพิ่ม service อื่นๆ ที่นี่
}
```

## โครงสร้าง Folder ของ Service

```
Services/
├── CallResult/
│   ├── ICallResultService.cs
│   └── CallResultService.cs
├── Order/
│   ├── IOrderService.cs
│   └── OrderService.cs
└── Auth/         # สำหรับ authentication services
```

## ILoginDetailServices — ดึงข้อมูล User

```csharp
// Inject ใน service
private readonly ILoginDetailServices _login;

// ใช้งาน
var user = _login.GetClaim();
var userId = user.UserId;
var employeeCode = user.EmployeeCode;
var branchId = user.BranchId;

// ตรวจสอบ permission
bool canRead = _login.CheckPermission(Permission.Agent);
```

**ข้อมูลที่ดึงได้จาก GetClaim():**

| Property | Type | คำอธิบาย |
|----------|------|----------|
| UserId | int | รหัสผู้ใช้งาน |
| EmployeeCode | string | รหัสพนักงาน |
| Firstname | string | ชื่อ |
| Lastname | string | นามสกุล |
| BranchId | int | รหัสสาขา |
| Branchname | string | ชื่อสาขา |

## DTO Naming Conventions

| Suffix | ใช้เมื่อ | ตัวอย่าง |
|--------|----------|----------|
| `Dto` | ทั่วไป | `UserDto` |
| `RequestDto` | รับข้อมูลจาก client | `UserRequestDto` |
| `ResponseDto` | ส่งข้อมูลกลับ client | `UserResponseDto` |
| `CreateDto` | สร้างข้อมูลใหม่ | `UserCreateDto` |
| `UpdateDto` | อัพเดทข้อมูล | `UserUpdateDto` |
| `FilterDto` | กรองข้อมูล | `UserFilterDto` |
| `TableDto` | แสดงในตาราง | `UserTableDto` |

**การจัดเก็บ DTO:**
```
DTOs/
├── CallResult/
│   ├── CallResultTableDto.cs
│   ├── CallResultResponseDto.cs
│   ├── CallResultRequestDto.cs
│   └── CallResultFilterDto.cs
```

**Flatten DTO:** ให้ flatten nested object ออกมาเป็น property ตรงๆ เพื่อให้ใช้งานง่ายขึ้น

## AutoMapper

### ตั้งค่า Mapping ใน AutoMapperProfile.cs

```csharp
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // Mapping ชื่อ property เหมือนกัน
        CreateMap<User, UserDto>().ReverseMap();

        // Mapping ชื่อ property ต่างกัน
        CreateMap<User, UserDto>()
            .ForMember(
                dest => dest.FullName,
                opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

        // Map request DTO → Entity
        CreateMap<CallResultRequestDto, CallResult>();

        // Map Entity → Response DTO
        CreateMap<CallResult, CallResultResponseDto>();
        CreateMap<CallResult, CallResultTableDto>();
    }
}
```

### ใช้งาน AutoMapper ใน Service

```csharp
// Map object เดียว
var entity = _mapper.Map<CallResult>(request);
var response = _mapper.Map<CallResultResponseDto>(entity);

// Map request เข้า entity ที่มีอยู่แล้ว (สำหรับ Update)
_mapper.Map(request, entity);

// LINQ Projection — ดีกว่า Map หลัง query เสร็จ
var result = await query
    .ProjectTo<CallResultResponseDto>(_mapper.ConfigurationProvider)
    .ToListAsync();
```

> ห้ามใช้ `MappingExtension` class ที่มีใน project เก่า เพราะอาจเกิด Memory Leak
