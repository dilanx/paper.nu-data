# paper.nu data automation

## Key mapping

To significantly reduce data size, repeated keys are shortened. For example, instead of 3000 courses each having a `description` property, they have a `d` property, thus resulting in 10 \* 3000 less characters in the file. This takes up less bandwidth when downloading from the CDN and less storaged when cached on the client. The client can map the data in reverse if necessary.

### Plan data

#### Majors

| Short | Long    |
| ----- | ------- |
| i     | id      |
| c     | color   |
| d     | display |

#### Courses

| Short | Long        |
| ----- | ----------- |
| i     | id          |
| n     | name        |
| u     | units       |
| r     | repeatable  |
| d     | description |
| p     | prereqs     |
| s     | distros     |
| l     | placeholder |

### Schedule data

#### Courses

| Short | Long      |
| ----- | --------- |
| i     | course_id |
| c     | school    |
| t     | title     |
| u     | subject   |
| n     | number    |
| s     | sections  |

#### Sections

| Short | Long         |
| ----- | ------------ |
| i     | section_id   |
| r     | instructors  |
| t     | title        |
| u     | subject      |
| n     | number       |
| s     | section      |
| m     | meeting_days |
| x     | start_time   |
| y     | end_time     |
| l     | room         |
| d     | start_date   |
| e     | end_date     |
| c     | component    |
| a     | capacity     |
| q     | enrl_req     |
| p     | descs        |
| o     | distros      |

#### Instructors

| Short | Long           |
| ----- | -------------- |
| n     | name           |
| p     | phone          |
| a     | campus_address |
| o     | office_hours   |
| b     | bio            |
| u     | url            |
