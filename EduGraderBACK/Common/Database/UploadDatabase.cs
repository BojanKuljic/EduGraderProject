﻿using Common.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Database
{
    public class UploadDatabase
    {
        private readonly IMongoCollection<StudentUpload> _uploads;

        public UploadDatabase(string connectionString, string databaseName, string collectionName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _uploads = database.GetCollection<StudentUpload>(collectionName);
        }

        public async Task<StudentUpload> GetUpload(string id)
        {
            return await _uploads.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task<bool> AddUpload(StudentUpload upload)
        {
            await _uploads.InsertOneAsync(upload);
            return true;
        }
        public async Task<bool> UpdateUpload(string id, StudentUpload updatedUpload)
        {
            var result = await _uploads.ReplaceOneAsync(u => u.Id == id, updatedUpload);
            return result.ModifiedCount > 0;
        }
        public async Task<bool> DeleteUpload(string id)
        {
            var result = await _uploads.DeleteOneAsync(u => u.Id == id);
            return result.DeletedCount > 0;
        }
        public async Task<List<StudentUpload>> GetStudentUploadsByEmail(string email)
        {
            return await _uploads.Find(u => u.Email == email).ToListAsync();
        }
        public async Task<List<StudentUpload>> GetAllUploads()
        {
            return await _uploads.Find(_ => true).ToListAsync();
        }
    }
}
