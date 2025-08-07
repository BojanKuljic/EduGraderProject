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
            var filter = Builders<User>.Filter.Eq(u => u.email, email);
            var update = Builders<User>.Update
                .Set(u => u.name, updatedUser.name)
                .Set(u => u.email, updatedUser.email)
                .Set(u => u.password, updatedUser.password)
                .Set(u => u.restrictions, updatedUser.restrictions);

            var result = await _users.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetUserRestrictions(string email, List<string> restrictions)
        {
            var update = Builders<User>.Update.Set(u => u.restrictions, restrictions);
            var result = await _users.UpdateOneAsync(u => u.email == email, update);
            return result.ModifiedCount > 0;
        }

        public async Task<IEnumerable<User>> GetAllSystemUsers()
        {
            var allUsers = await _users.Find(Builders<User>.Filter.Empty).ToListAsync();

            return allUsers
                .OrderBy(u => u.role == "Admin" ? 0 : u.role == "Professor" ? 1 : 2)  // Sort: Admin < Professor < Student
                .ThenBy(u => u.name); // dodatno po imenu unutar svake grupe
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
