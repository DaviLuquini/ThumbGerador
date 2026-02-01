using Microsoft.EntityFrameworkCore;
using ThumbGenerator.Domain.Entities;

namespace ThumbGenerator.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ThumbnailGeneration> ThumbnailGenerations => Set<ThumbnailGeneration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(256).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<ThumbnailGeneration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TemplateId).HasMaxLength(64).IsRequired();
            entity.Property(e => e.GeneratedImagePath).HasMaxLength(512);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Generations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
