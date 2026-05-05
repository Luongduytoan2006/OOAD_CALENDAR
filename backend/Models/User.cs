namespace CalendarApi.Models;

public class User
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";

    public User() { }

    public User(int userId, string fullName)
    {
        UserId = userId;
        FullName = fullName;
    }
}
