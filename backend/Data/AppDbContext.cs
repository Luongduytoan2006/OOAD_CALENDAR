using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<GroupMeeting> GroupMeetings => Set<GroupMeeting>();
    public DbSet<Reminder> Reminders => Set<Reminder>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.FullName).HasMaxLength(255).IsRequired();
        });

        // Appointment - TPH (Table Per Hierarchy) cho inheritance
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.EndTime).IsRequired();
            entity.Property(e => e.IsGroupMeeting).IsRequired();

            entity.HasOne(e => e.Owner)
                  .WithMany()
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Reminders)
                  .WithOne()
                  .HasForeignKey(r => r.AppointmentId)
                  .OnDelete(DeleteBehavior.Cascade);

            // TPH discriminator
            entity.HasDiscriminator(e => e.IsGroupMeeting)
                  .HasValue<Appointment>(false)
                  .HasValue<GroupMeeting>(true);
        });

        // GroupMeeting - many-to-many with User (participants)
        modelBuilder.Entity<GroupMeeting>(entity =>
        {
            entity.HasMany(e => e.Participants)
                  .WithMany()
                  .UsingEntity<Dictionary<string, object>>(
                      "Participant",
                      j => j.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.NoAction),
                      j => j.HasOne<GroupMeeting>().WithMany().HasForeignKey("AppointmentId").OnDelete(DeleteBehavior.Cascade),
                      j =>
                      {
                          j.HasKey("AppointmentId", "UserId");
                          j.ToTable("Participants");
                      });
        });

        // Reminder
        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(e => e.ReminderId);
            entity.Property(e => e.RemindAt).IsRequired();
            entity.Property(e => e.Method).HasConversion<string>().HasMaxLength(50).IsRequired();
        });

        // Seed data từ DbSeeder (chạy qua migration)
        DbSeeder.Seed(modelBuilder);
    }
}
