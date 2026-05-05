namespace CalendarApi.Models;

/// <summary>
/// User entity.
/// </summary>
public class User
{
    public int UserId { get; set; }
    public string FullName { get; set; }

    public User(int userId, string fullName)
    {
        UserId = userId;
        FullName = fullName;
    }
}
