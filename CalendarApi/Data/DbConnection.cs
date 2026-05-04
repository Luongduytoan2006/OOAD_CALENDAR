using Microsoft.Data.Sqlite;

namespace CalendarApi.Data;

/// <summary>
/// Provides a singleton SQLite connection, equivalent to the TypeScript DbConnection class.
/// </summary>
public class DbConnection
{
    private static SqliteConnection? _connection;
    private static readonly object _lock = new();
    private readonly string _connectionString;

    public DbConnection(IConfiguration configuration)
    {
        var dbPath = configuration["Database:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "..", "calendar.db");
        _connectionString = $"Data Source={dbPath}";
    }

    public SqliteConnection GetConnection()
    {
        if (_connection != null && _connection.State == System.Data.ConnectionState.Open)
            return _connection;

        lock (_lock)
        {
            if (_connection != null && _connection.State == System.Data.ConnectionState.Open)
                return _connection;

            _connection = new SqliteConnection(_connectionString);
            _connection.Open();
            Console.WriteLine($"✅ Connected to SQLite database: {_connectionString}");
            return _connection;
        }
    }
}
