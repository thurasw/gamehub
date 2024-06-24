using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ReviewService.Models;

namespace ReviewService.Data
{
    public class ReviewServiceContext : DbContext
    {
        public ReviewServiceContext (DbContextOptions<ReviewServiceContext> options)
            : base(options)
        {
        }

        public DbSet<ReviewService.Models.Review> Review { get; set; }
    }
}
