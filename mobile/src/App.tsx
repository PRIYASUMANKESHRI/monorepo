import React, { useState, useEffect } from 'react';
    import {
      View,
      Text,
      TextInput,
      Button,
      FlatList,
      StyleSheet,
      TouchableOpacity,
      Alert,
    } from 'react-native';
    import { createClient } from '@supabase/supabase-js';
    import { Task } from '@task-manager/shared';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { Link, useRouter } from 'expo-router';
    import { StatusBar } from 'expo-status-bar';

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const App = () => {
      const [tasks, setTasks] = useState<Task[]>([]);
      const [newTask, setNewTask] = useState('');
      const [user, setUser] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const router = useRouter();

      useEffect(() => {
        const loadSession = async () => {
          const sessionString = await AsyncStorage.getItem('supabase.auth.session');
          if (sessionString) {
            const session = JSON.parse(sessionString);
            setUser(session?.user);
            if (session?.user) {
              fetchTasks(session.user.id);
            }
          }
          setLoading(false);
        };

        loadSession();

        supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user);
          if (session?.user) {
            await AsyncStorage.setItem('supabase.auth.session', JSON.stringify(session));
            fetchTasks(session.user.id);
          } else {
            await AsyncStorage.removeItem('supabase.auth.session');
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
        const email = await new Promise((resolve) =>
          Alert.prompt('Enter your email', '', resolve),
        );
        const password = await new Promise((resolve) =>
          Alert.prompt('Enter your password', '', resolve),
        );

        if (!email || !password) return;

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          console.error('Error signing up:', error);
        }
      };

      const handleLogin = async () => {
        const email = await new Promise((resolve) =>
          Alert.prompt('Enter your email', '', resolve),
        );
        const password = await new Promise((resolve) =>
          Alert.prompt('Enter your password', '', resolve),
        );

        if (!email || !password) return;

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
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
        return <Text>Loading...</Text>;
      }

      return (
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Text style={styles.title}>Task Manager</Text>
          {!user ? (
            <View>
              <Button title="Sign Up" onPress={handleSignUp} />
              <Button title="Log In" onPress={handleLogin} />
            </View>
          ) : (
            <View>
              <Button title="Log Out" onPress={handleLogout} />
              <TextInput
                style={styles.input}
                value={newTask}
                onChangeText={setNewTask}
                placeholder="Add new task"
              />
              <Button title="Add Task" onPress={handleAddTask} />
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.taskItem}
                    onPress={() => handleToggleComplete(item)}
                  >
                    <Text
                      style={[
                        styles.taskText,
                        item.completed && styles.completedTask,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Button
                      title="Delete"
                      onPress={() => handleDeleteTask(item.id)}
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
      },
      taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 5,
      },
      taskText: {
        fontSize: 16,
      },
      completedTask: {
        textDecorationLine: 'line-through',
        color: 'gray',
      },
    });

    export default App;
