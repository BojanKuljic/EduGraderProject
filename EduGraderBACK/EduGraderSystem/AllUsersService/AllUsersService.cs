using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.Database;
using Common.Models;
using Common.Requests;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Common.Services;

namespace AllUsersService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class AllUsersService : StatefulService, IAllUsersService
    {
        private readonly UserDatabase _userDatabase;
        public AllUsersService(StatefulServiceContext context)
                : base(context)
        {
            _userDatabase = new UserDatabase("mongodb://localhost:27017", "AllUsersDatabase", "Users");
        }
        public async Task<bool> Register(Register user)
        {
            var existingUser = await _userDatabase.GetUserByEmail(user.email);
            if (existingUser != null)
            {
                return false;
            }

            var newUser = new User
            {
                name = user.name,
                email = user.email,
                password = user.password,
                role = "Student",
                restrictions = new List<string>()
            };

            await _userDatabase.AddUser(newUser);
            return true;
        }

        public async Task<User> Login(Login request)
        {
            var user = await _userDatabase.GetUserByEmail(request.email);
            if (user != null && user.password == request.password)
            {
                return user;
            }
            return null;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _userDatabase.GetUserByEmail(email);
        }

        public async Task<IEnumerable<User>> GetAllStudents()
        {
            return await _userDatabase.GetAllStudents();
        }

        public async Task<bool> UpdateUser(string email, User user)
        {
            return await _userDatabase.UpdateUser(email, user);
        }

        public async Task<bool> AddUserRestriction(string restriction, string email)
        {
            var user = await _userDatabase.GetUserByEmail(email);
            if (user == null) return false;

            if (!user.restrictions.Contains(restriction))
            {
                user.restrictions.Add(restriction);
                return await _userDatabase.UpdateUser(email, user);
            }

            return true;
        }

        public async Task<bool> RemoveUserRestriction(string restriction, string email)
        {
            var user = await _userDatabase.GetUserByEmail(email);
            if (user == null) return false;

            if (user.restrictions.Contains(restriction))
            {
                user.restrictions.Remove(restriction);
                return await _userDatabase.UpdateUser(email, user);
            }

            return true;
        }

        public async Task<bool> ChangeUserRole(string email, string newRole)
        {
            return await _userDatabase.ChangeUserRoleAsync(email, newRole);
        }

        public async Task<bool> DeleteUser(string email)
        {
            return await _userDatabase.DeleteUserAsync(email);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners() => this.CreateServiceRemotingReplicaListeners();

    }
}
