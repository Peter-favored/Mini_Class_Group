// models/index.js
import sequelize from "./src/config/database.js"
import { DataTypes } from 'sequelize';

import User from './src/models/user.model.js';
import Timetable from './src/models/timetable.models.js';
import Notice from './src/models/notices.model.js';
import Assignment from './src/models/assignments.models.js';
import Submission from './src/models/submission.models.js';
import StudentNotice from './src/models/studentNotices.models.js';



 // 1) Class rep (User.role='classRep') posts many Notices
 
User.hasMany(Notice, {
  foreignKey: 'classRepId',
  as: 'postedNotices',
  onDelete: 'CASCADE',   // if a class rep is removed, remove their notices
  onUpdate: 'CASCADE'
});
Notice.belongsTo(User, {
  foreignKey: 'classRepId',
  as: 'classRep'
});


 // 2) Many students have access to many notices (through table)
User.belongsToMany(Notice, {
  through: StudentNotice,
  as: 'accessibleNotices',
  foreignKey: 'studentId',
  otherKey: 'noticeId'
});
Notice.belongsToMany(User, {
  through: StudentNotice,
  as: 'students',
  foreignKey: 'noticeId',
  otherKey: 'studentId'
});


//  3) Each student has many submissions

User.hasMany(Submission, {
  foreignKey: 'studentId',
  as: 'submissions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Submission.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});


// 4) Each assignment has many submissions

Assignment.hasMany(Submission, {
  foreignKey: 'assignmentId',
  as: 'assignmentSubmissions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Submission.belongsTo(Assignment, {
  foreignKey: 'assignmentId',
  as: 'assignment'
});


// 5) link Timetable to the creator (class rep)
User.hasMany(Timetable, {
  foreignKey: 'createdById',
  as: 'createdTimetables'
});
Timetable.belongsTo(User, { 
  foreignKey: 'createdById', 
  as: 'createdBy' });

// Export initialized Sequelize + models
export {
  sequelize,
  User,
  Timetable,
  Notice,
  Assignment,
  Submission,
  StudentNotice
};


//SYNCING MY CODEBASE WITH THE DATABASE

(async () => {
  try {
    console.log("Connecting to MySQL…");
    await sequelize.authenticate();
    console.log("✓ DB connection OK");

    await sequelize.sync({ alter: true }); 
        console.log("✓ Models synced with MySQL");

    // quick probe to confirm tables exist
    const [tables] = await sequelize.query("SHOW TABLES;");
    console.log("Tables:", tables);

    process.exit(0);
  } catch (err) {
    console.error("✗ Sync failed:", err);
    process.exit(1);
  }
})();