using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Models;
using Common.Requests;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Services
{
    public interface IAllUsersService : IService
    {
        Task<bool> Register(Register user);
        Task<User> Login(Login request);

        Task<User> GetUserByEmail(string email);

        Task<IEnumerable<User>> GetAllStudents();

        Task<bool> UpdateUser(string email, User user);

        Task<bool> AddUserRestriction(string restriction, string email);

        Task<bool> RemoveUserRestriction(string restriction, string email);
        Task<bool> IsUserRestricted(string restriction, string email);

        Task<bool> ChangeUserRole(string email, string newRole);

        Task<bool> DeleteUser(string email);
    }
}
