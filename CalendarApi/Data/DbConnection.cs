using MySqlConnector;

namespace CalendarApi.Data;

/// <summary>
/// Provides a singleton MySQL connection.
/// </summary>
public class DbConnection
{
    private static MySqlConnection? _connection;
    private static readonly object _lock = new();
    private readonly string _connectionString;

    public DbConnection(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=localhost;Port=3306;Database=calendar_db;Uid=root;Pwd=;";
    }

    public MySqlConnection GetConnection()
    {
        if (_connection != null && _connection.State == System.Data.ConnectionState.Open)
            return _connection;

        lock (_lock)
        {
            if (_connection != null && _connection.State == System.Data.ConnectionState.Open)
                return _connection;

            _connection = new MySqlConnection(_connectionString);
            _connection.Open();
            Console.WriteLine($"✅ Connected to MySQL database: {_connectionString}");
            return _connection;
        }
    }
}
