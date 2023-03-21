# paper.nu data automation

## Key mapping

To significantly reduce data size, repeated keys are shortened. For example, instead of 3000 courses each having a `description` property, they have a `d` property, thus resulting in 10 \* 3000 less characters in the file. This takes up less bandwidth when downloading from the CDN and less storaged when cached on the client. The client can map the data in reverse if necessary.

### Plan data

#### Major

| Short | Long    | Type   |
| ----- | ------- | ------ |
| i     | id      | string |
| c     | color   | string |
| d     | display | string |

#### Course

| Short | Long        | Type    |
| ----- | ----------- | ------- |
| i     | id          | string  |
| n     | name        | string  |
| u     | units       | string  |
| r     | repeatable  | boolean |
| d     | description | string  |
| p     | prereqs     | string  |
| s     | distros     | string  |
| l     | placeholder | boolean |

### Schedule data

#### Course

| Short | Long      | Type                  |
| ----- | --------- | --------------------- |
| i     | course_id | string                |
| c     | school    | string                |
| t     | title     | string                |
| u     | subject   | string                |
| n     | number    | string                |
| s     | sections  | [Section](#section)[] |

#### Section

| Short | Long         | Type                         |
| ----- | ------------ | ---------------------------- |
| i     | section_id   | string                       |
| r     | instructors  | [Instructor](#instructor)[]  |
| t     | title        | string                       |
| k     | topic        | string                       |
| u     | subject      | string                       |
| n     | number       | string                       |
| s     | section      | string                       |
| m     | meeting_days | \(string \| null\)[]         |
| x     | start_time   | \([Time](#time) \| null\)[]  |
| y     | end_time     | \([Time](#time) \| null \)[] |
| l     | room         | string[]                     |
| d     | start_date   | string                       |
| e     | end_date     | string                       |
| c     | component    | string                       |
| a     | capacity     | int                          |
| q     | enrl_req     | string                       |
| p     | descs        | string[][]                   |
| o     | distros      | string                       |

#### Instructor

| Short | Long           | Type   |
| ----- | -------------- | ------ |
| n     | name           | string |
| p     | phone          | string |
| a     | campus_address | string |
| o     | office_hours   | string |
| b     | bio            | string |
| u     | url            | string |

#### Time

| Short | Long\* | Type |
| ----- | ------ | ---- |
| h     | hour   | int  |
| m     | minute | int  |

\* These are not converted from short to long. They remain in their short form.
