import React, { useState, useEffect } from 'react';
    import { createClient } from '@supabase/supabase-js';
    import { Task } from '@task-manager/shared';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    function App() {
      const [tasks, setTasks] = useState<Task[]>([]);
      const [newTask, setNewTask] = useState('');
      const [user, setUser] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const [signUpEmail, setSignUpEmail] = useState('');
      const [signUpPassword, setSignUpPassword] = useState('');
      const [loginEmail, setLoginEmail] = useState('');
      const [loginPassword, setLoginPassword] = useState('');

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user);
          if (session?.user) {
            fetchTasks(session.user.id);
          }
          setLoading(false);
        });

        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user);
          if (session?.user) {
            fetchTasks(session.user.id);
          } else {
            setTasks([]);
          }
        });
      }, []);

      const fetchTasks = async (userId: string) => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: false });

        if (error) {
          console.error('Error fetching tasks:', error);
        } else {
          setTasks(data as Task[]);
        }
      };

      const handleAddTask = async () => {
        if (!newTask.trim() || !user) return;
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ title: newTask, completed: false, user_id: user.id }])
          .select();

        if (error) {
          console.error('Error adding task:', error);
        } else {
          setTasks([...tasks, ...(data as Task[])]);
          setNewTask('');
        }
      };

      const handleToggleComplete = async (task: Task) => {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: !task.completed })
          .eq('id', task.id);

        if (error) {
          console.error('Error updating task:', error);
        } else {
          setTasks(
            tasks.map((t) =>
              t.id === task.id ? { ...t, completed: !t.completed } : t,
            ),
          );
        }
      };

      const handleDeleteTask = async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
          console.error('Error deleting task:', error);
        } else {
          setTasks(tasks.filter((task) => task.id !== id));
        }
      };

      const handleSignUp = async () => {
        const { error } = await supabase.auth.signUp({
          email: signUpEmail,
          password: signUpPassword,
        });
        if (error) {
          console.error('Error signing up:', error);
        }
      };

      const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (error) {
          console.error('Error logging in:', error);
        }
      };

      const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error logging out:', error);
        }
      };

      if (loading) {
        return <div>Loading...</div>;
      }

      return (
        <div>
          <h1>Task Manager</h1>
          {!user ? (
            <div className="auth-container">
              <h2>Sign Up</h2>
              <input
                type="email"
                placeholder="Email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
              />
              <button onClick={handleSignUp}>Sign Up</button>

              <h2>Log In</h2>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button onClick={handleLogin}>Log In</button>
            </div>
          ) : (
            <div>
              <button onClick={handleLogout}>Log Out</button>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task"
              />
              <button onClick={handleAddTask}>Add Task</button>
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <span
                      className={task.completed ? 'completed' : ''}
                      onClick={() => handleToggleComplete(task)}
                      style={{ cursor: 'pointer' }}
                    >
                      {task.title}
                    </span>
                    <div>
                      <button onClick={() => handleDeleteTask(task.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    export default App;
