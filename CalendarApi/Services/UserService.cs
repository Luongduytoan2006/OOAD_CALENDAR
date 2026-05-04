using CalendarApi.Models;
using CalendarApi.Repositories;

namespace CalendarApi.Services;

/// <summary>
/// Business logic for User operations.
/// Migrated from TypeScript UserService.ts
/// </summary>
public class UserService
{
    private readonly UserRepository _userRepo;

    public UserService(UserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public List<User> GetAllUsers()
    {
        return _userRepo.GetAll();
    }

    public User? GetUserById(int userId)
    {
        return _userRepo.GetById(userId);
    }
}
