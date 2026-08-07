-- The Claude usage widget was removed - Anthropic's official spend data
-- requires converting the Console account to a team organization, which
-- wasn't worth doing for this. Usage is now tracked manually outside the app.

drop table if exists assistant_usage;
