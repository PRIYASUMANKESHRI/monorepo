# Task Manager Monorepo

    This monorepo contains a web application built with React and TypeScript, and a mobile application built with React Native. Both applications share a Supabase backend for authentication and task management.

    ## Structure

    - `packages/shared`: Contains shared code, types, and utilities.
    - `web`: Contains the React+TypeScript web application.
    - `mobile`: Contains the React Native mobile application.

    ## Setup

    1.  Install dependencies:

        ```bash
        npm install
        ```

    2.  Navigate to the `web` directory and install dependencies:

        ```bash
        cd web
        npm install
        ```

    3.  Navigate to the `mobile` directory and install dependencies:

        ```bash
        cd mobile
        npm install
        ```

    4.  Set up Supabase:
        - Create a new Supabase project.
        - Create a `tasks` table with columns: `id` (UUID), `title` (text), `completed` (boolean), `user_id` (UUID).
        - Enable Realtime for the `tasks` table.
        - **Add your Supabase URL and anon key to the `.env` files in `web` and `mobile` directories.**
        - In the `web` directory, create a `.env` file (if it doesn't exist) and add:
          ```
          VITE_SUPABASE_URL=<your_supabase_url>
          VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
          ```
          **Replace `<your_supabase_url>` and `<your_supabase_anon_key>` with your actual Supabase URL and anon key.**
        - In the `mobile` directory, create a `.env` file (if it doesn't exist) and add:
          ```
          SUPABASE_URL=<your_supabase_url>
          SUPABASE_ANON_KEY=<your_supabase_anon_key>
          ```
          **Replace `<your_supabase_url>` and `<your_supabase_anon_key>` with your actual Supabase URL and anon key.**

    5.  Run the web application:

        ```bash
        npm run dev
        ```

    6.  Run the mobile application:

        ```bash
        npm run mobile
        ```

    ## Troubleshooting

    - Ensure you have Node.js and npm installed.
    - Make sure your Supabase URL and anon key are correctly configured in both projects.
    - If you encounter issues with the mobile app, ensure you have the necessary React Native development environment set up.
