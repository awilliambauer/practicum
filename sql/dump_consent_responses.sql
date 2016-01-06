-- @author whitab
-- This sql script dumps the most recent consent responses for each user,
-- 'agree' or 'disagree'. If they haven't responded to the consent, they'll
-- have a value of 'noresponse'.

-- To run this this, run psql. If you have access, that should be:
-- % psql

-- Then, connect to the csed_logging database:
-- psql>=# \c csed_logging 

-- Then, run this script with: (modify path if necessary)
-- psql>=# \i /srv/csed/sql/dump_consent_responses.sql 

-- And it produces/overwrites: /tmp/responses.csv

-- First, get all the events of type 11 -- consent response
--  in a table, matched up with the user id
CREATE OR REPLACE VIEW all_responses_by_user AS
(
  select s.user_id,
         e.server_time,
         e.detail
    from event e 
    join session s
      on s.id = e.session_id
    where e.type_id = 11
);

-- Then, find the lastest event time from that table,
--  partitioning  by user, because we want the lastest event
--  for each user.
CREATE OR REPLACE VIEW last_response_time AS
(
  select user_id,
         MAX(server_time) as server_time
    from all_responses_by_user
    group by user_id
);

-- Now grab the event that had the latest time for each user
CREATE OR REPLACE VIEW last_response AS
(
  select lrt.user_id,
         arbu.detail,
         arbu.server_time
    from last_response_time lrt
      join all_responses_by_user arbu
      on lrt.user_id = arbu.user_id 
    where lrt.server_time = arbu.server_time
);

-- Now parse out the information from the detail block
CREATE OR REPLACE VIEW  username_response AS 
(
  select user_id,
         substring( detail from 'username\\":\\"([^\\]*)') as username, 
         substring( detail from 'response\\":\\"([^\\]*)') as response,
         server_time
--         count(*)
    from last_response
--    group by username
);

-- Now, left join the public.user table against those who
--  have responded, to make sure we didn't leave anyone out.
CREATE OR REPLACE VIEW total AS
(
  select u.id,
         u.username,
         COALESCE(ur.response, 'noresponse')
    from public.user u
      left join username_response ur
      on u.id = ur.user_id
);

-- And then, dump it to a file:
COPY (select * from total) TO '/tmp/responses.csv' With CSV;

