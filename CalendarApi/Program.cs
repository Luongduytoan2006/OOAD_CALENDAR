using CalendarApi.Data;
using CalendarApi.Repositories;
using CalendarApi.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ─── Services ───────────────────────────────────────────────────────────────

// JSON serialization: use camelCase + handle enum as string (match TypeScript API)
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// CORS — allow Vite dev server (port 3600) and any origin in dev
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database
builder.Services.AddSingleton<DbConnection>();

// Repositories
builder.Services.AddSingleton<UserRepository>();
builder.Services.AddSingleton<AppointmentRepository>();
builder.Services.AddSingleton<GroupMeetingRepository>();

// Services
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<AppointmentService>();
builder.Services.AddSingleton<GroupMeetingService>();

// ─── App ────────────────────────────────────────────────────────────────────

var app = builder.Build();

// --- Khởi tạo tự động Database ---
var connString = app.Configuration.GetConnectionString("DefaultConnection") 
                 ?? "Server=localhost;Port=3306;Database=calendar_db;Uid=root;Pwd=;";
DatabaseInitializer.Initialize(connString);

app.UseCors();

app.UseDefaultFiles();   // serves index.html for "/"
app.UseStaticFiles();    // serves wwwroot/ (frontend build output)

app.MapControllers();

Console.WriteLine("🚀 CalendarApi (ASP.NET Core C#) running!");

app.Run();
