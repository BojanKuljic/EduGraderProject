using Common.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Database
{
    public class UserDatabase
    {
        private readonly IMongoCollection<User> _users;

        public UserDatabase(string connectionString, string databaseName, string collectionName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _users = database.GetCollection<User>(collectionName);
        }

        public async Task<User> GetUserByEmail(string id)
        {
            return await _users.Find(u => u.email == id).FirstOrDefaultAsync();
        }

        public async Task AddUser(User user)
        {
            await _users.InsertOneAsync(user);
        }

        public async Task<bool> UpdateUser(string email, User updatedUser)
        {
            var result = await _users.ReplaceOneAsync(u => u.email == email, updatedUser);
            return result.ModifiedCount > 0;
        }

        public async Task<List<User>> GetAllUsers()
        {
            return await _users.Find(_ => true).ToListAsync();
        }

        public async Task<List<User>> GetAllStudents()
        {
            return await _users.Find(u => u.role == "Student").ToListAsync();
        }

        public async Task<bool> ChangeUserRoleAsync(string email, string newRole)
        {
            var update = Builders<User>.Update.Set(u => u.role, newRole);
            var result = await _users.UpdateOneAsync(u => u.email == email, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var result = await _users.DeleteOneAsync(u => u.email == id);
            return result.DeletedCount > 0;
        }
    }
}
