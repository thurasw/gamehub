using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PromoService.Models;

namespace PromoService.Data
{
    public class PromoServiceContext : DbContext
    {
        public PromoServiceContext (DbContextOptions<PromoServiceContext> options)
            : base(options)
        {
        }

        public DbSet<PromoService.Models.Promo> Promo { get; set; }
    }
}
