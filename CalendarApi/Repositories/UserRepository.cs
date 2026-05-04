using CalendarApi.Data;
using CalendarApi.Models;
using Microsoft.Data.Sqlite;

namespace CalendarApi.Repositories;

/// <summary>
/// Handles all database operations for User entities.
/// </summary>
public class UserRepository
{
    private readonly DbConnection _db;

    public UserRepository(DbConnection db)
    {
        _db = db;
    }

    public List<User> GetAll()
    {
        var conn = _db.GetConnection();
        var users = new List<User>();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM users";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            users.Add(new User(
                reader.GetInt32(reader.GetOrdinal("user_id")),
                reader.GetString(reader.GetOrdinal("full_name"))
            ));
        }

        return users;
    }

    public User? GetById(int userId)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM users WHERE user_id = $userId";
        cmd.Parameters.AddWithValue("$userId", userId);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new User(
                reader.GetInt32(reader.GetOrdinal("user_id")),
                reader.GetString(reader.GetOrdinal("full_name"))
            );
        }

        return null;
    }
}
